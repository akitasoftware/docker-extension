package handler

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"context"
	"errors"
	"github.com/labstack/gommon/log"
	"golang.org/x/sync/errgroup"
)

type ManageAgentLifecycle struct {
	repo agent.Repository
}

func NewManageAgentHandler(repo agent.Repository) *ManageAgentLifecycle {
	return &ManageAgentLifecycle{repo: repo}
}

func (h *ManageAgentLifecycle) Handle(ctx context.Context) error {
	// Fetch the current agent config and container state.
	eg, egCtx := errgroup.WithContext(ctx)

	var (
		config *agent.Config
		state  *agent.State
	)

	eg.Go(
		func() error {
			result, err := h.repo.GetConfig(egCtx)
			if err != nil {
				if errors.Is(err, failure.ErrNotFound) {
					return nil
				}
				return err
			}

			config = result

			return nil
		},
	)

	eg.Go(
		func() error {
			result, err := h.repo.GetAgentStatus(egCtx)
			if err != nil {
				return err
			}

			state = result
			return nil
		},
	)

	err := eg.Wait()
	if err != nil {
		return err
	}

	log.Infof("config: %v, state: %v", config, state)

	// If there is no config, or the agent is not enabled, remove the agent container if it exists.
	if config == nil || config.IsEnabled == false {
		log.Info("Removing agent container as no config was found or agent is disabled")
		return h.repo.RemoveAgent(ctx)
	}

	if state.IsRunning() {
		log.Info("Agent container is running")
		return nil
	}

	log.Info("Agent container is not running, starting it")
	// If the agent is enabled, but not running, remove the agent container if  it exists, and start a new one.
	if err := h.repo.RemoveAgent(ctx); err != nil {
		return err
	}

	return h.repo.RunAgent(ctx)
}
