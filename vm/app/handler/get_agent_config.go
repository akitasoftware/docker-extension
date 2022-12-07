package handler

import (
	"akita/domain/agent"
	"context"
)

type GetAgentConfig struct {
	agentRepo agent.Repository
}

func NewGetAgentConfigHandler(agentRepo agent.Repository) *GetAgentConfig {
	return &GetAgentConfig{agentRepo: agentRepo}
}

func (h *GetAgentConfig) Handle(ctx context.Context) (*agent.Config, error) {
	return h.agentRepo.GetConfig(ctx)
}
