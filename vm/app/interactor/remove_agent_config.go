package interactor

import (
	"akita/domain/agent"
	"context"
)

type RemoveAgentConfig struct {
	agentRepo agent.Repository
}

func NewRemoveAgentConfigInteractor(agentRepo agent.Repository) *RemoveAgentConfig {
	return &RemoveAgentConfig{
		agentRepo: agentRepo,
	}
}

// Removes the agent configuration.
func (r RemoveAgentConfig) Handle(ctx context.Context) error {
	return r.agentRepo.DeleteConfig(ctx)
}
