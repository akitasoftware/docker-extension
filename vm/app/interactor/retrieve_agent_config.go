package interactor

import (
	"akita/domain/agent"
	"akita/domain/container"
	"akita/domain/user"
	"context"
	"github.com/akitasoftware/go-utils/optionals"
	"github.com/labstack/gommon/log"
)

type RetrieveAgentConfig struct {
	agentRepo     agent.Repository
	containerRepo container.Repository
	userRepo      user.Repository
}

func NewRetrieveAgentConfigInteractor(
	agentRepository agent.Repository,
	containerRepository container.Repository,
	userRepository user.Repository,
) *RetrieveAgentConfig {
	return &RetrieveAgentConfig{
		agentRepo:     agentRepository,
		containerRepo: containerRepository,
		userRepo:      userRepository,
	}
}

// Retrieves the agent configuration and fixes it if necessary.
func (r RetrieveAgentConfig) Handle(ctx context.Context) (*agent.Config, error) {
	if err := r.fixAgentConfig(ctx); err != nil {
		return nil, err
	}

	return r.agentRepo.GetConfig(ctx)
}

// Checks if the agent is configured to watch a specific container and disables
// it if the container doesn't exist or isn't running.
func (r RetrieveAgentConfig) fixAgentConfig(ctx context.Context) error {
	agentConfig, err := r.agentRepo.GetConfig(ctx)
	if err != nil {
		return err
	}

	if agentConfig.TargetContainer == nil {
		return nil
	}

	// If the agent is configured to watch a specific container, then we should
	// check that the container exists and is running.
	containerExists, err := r.containerRepo.Exists(
		ctx,
		*agentConfig.TargetContainer,
		optionals.Some(container.StatusRunning),
	)
	if err != nil {
		return err
	}

	if containerExists {
		return nil
	}

	err = r.userRepo.EnqueueUserEvent(
		user.NewEvent(
			agentConfig.Credentials(),
			"Agent Automatically Disabled",
			map[string]any{
				"reason": "Targeted container no longer exists or is not running",
			},
		),
	)
	if err != nil {
		log.Debugf("Failed to enqueue user event: %s", err)
	}

	// If the container doesn't exist or isn't running, then we should clear the
	// target container and disable the agent.
	agentConfig.TargetContainer = nil
	agentConfig.IsEnabled = false

	return r.agentRepo.SaveConfig(ctx, agentConfig)
}
