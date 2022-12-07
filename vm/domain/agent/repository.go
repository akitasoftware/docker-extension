package agent

import "context"

type Repository interface {
	GetConfig(ctx context.Context) (*Config, error)
	SaveConfig(ctx context.Context, agentConfig *Config) error
	DeleteConfig(ctx context.Context) error
	RunAgent(ctx context.Context) error
	GetAgentStatus(ctx context.Context) (*State, error)
	RemoveAgent(ctx context.Context) error
}
