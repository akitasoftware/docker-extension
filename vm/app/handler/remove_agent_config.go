package handler

import (
	"akita/domain/agent"
	"context"
)

type RemoveAgentConfig struct {
	agentRepo    agent.Repository
	agentManager *ManageAgentLifecycle
}

func NewRemoveAgentConfigHandler(agentRepo agent.Repository, agentManager *ManageAgentLifecycle) *RemoveAgentConfig {
	return &RemoveAgentConfig{agentRepo: agentRepo, agentManager: agentManager}
}

func (h *RemoveAgentConfig) Handle(ctx context.Context) error {
	err := h.agentRepo.DeleteConfig(ctx)
	if err != nil {
		return err
	}

	return h.agentManager.Handle(ctx)
}
