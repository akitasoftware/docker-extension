package interactor

import (
	"akita/domain/agent"
	"akita/domain/container"
	"akita/domain/failure"
	"akita/domain/user"
	"context"
	"github.com/akitasoftware/go-utils/optionals"
)

type SaveAgentConfig struct {
	agentRepo     agent.Repository
	containerRepo container.Repository
	userRepo      user.Repository
}

func NewSaveAgentConfigInteractor(
	agentRepository agent.Repository,
	containerRepository container.Repository,
	userRepository user.Repository,
) *SaveAgentConfig {
	return &SaveAgentConfig{
		agentRepo:     agentRepository,
		containerRepo: containerRepository,
		userRepo:      userRepository,
	}
}

// Saves the agent configuration.
func (s SaveAgentConfig) Handle(ctx context.Context, config *agent.Config) error {
	if config.Validate() != nil {
		return failure.Invalidf("invalid agent configuration")
	}

	// Check that the user exists.
	if _, err := s.userRepo.GetUser(config.Credentials()); err != nil {
		return err
	}

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
