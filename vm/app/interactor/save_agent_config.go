package interactor

import (
	"akita/domain/agent"
	"akita/domain/container"
	"akita/domain/failure"
	"context"
	"github.com/akitasoftware/go-utils/optionals"
)

type SaveAgentConfig struct {
	agentRepo     agent.Repository
	containerRepo container.Repository
}

func NewSaveAgentConfigInteractor(
	agentRepository agent.Repository,
	containerRepository container.Repository,
) *SaveAgentConfig {
	return &SaveAgentConfig{
		agentRepo:     agentRepository,
		containerRepo: containerRepository,
	}
}

// Saves the agent configuration.
func (s SaveAgentConfig) Handle(ctx context.Context, config *agent.Config) error {
	if config.TargetContainer == nil {
		return s.agentRepo.SaveConfig(ctx, config)
	}

	containerExists, err := s.containerRepo.Exists(
		ctx,
		*config.TargetContainer,
		optionals.Some(container.StatusRunning),
	)
	if err != nil {
		return err
	}

	if !containerExists {
		return failure.Unprocessablef("container %s does not exist or is not running", *config.TargetContainer)
	}

	return s.agentRepo.SaveConfig(ctx, config)
}
