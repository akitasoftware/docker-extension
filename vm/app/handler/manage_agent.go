package handler

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"context"
	"errors"
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
	eg, ctx := errgroup.WithContext(ctx)

	var (
		config *agent.Config
		state  *agent.State
	)

	eg.Go(
		func() error {
			result, err := h.repo.GetConfig(ctx)
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
			result, err := h.repo.GetAgentStatus(ctx)
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

	// If there is no config, or the agent is not enabled, remove the agent container if it exists.
	if config == nil || config.IsEnabled == false {
		return h.repo.RemoveAgent(ctx)
	}

	if state.IsRunning() {
		return nil
	}

	// If the agent is enabled, but not running, remove the agent container if  it exists, and start a new one.
	if err := h.repo.RemoveAgent(ctx); err != nil {
		return err
	}

	return h.repo.RunAgent(ctx)
}
