package handler

import (
	"akita/domain/agent"
	"context"
)

type StoreAgentConfig struct {
	repo         agent.Repository
	agentManager *ManageAgentLifecycle
}

func NewStoreAgentConfig(repo agent.Repository, agentManager *ManageAgentLifecycle) *StoreAgentConfig {
	return &StoreAgentConfig{repo: repo, agentManager: agentManager}
}

func (h *StoreAgentConfig) Handle(ctx context.Context, config *agent.Config) error {
	err := h.repo.SaveConfig(ctx, config)
	if err != nil {
		return err
	}

	return h.agentManager.Handle(ctx)
}
