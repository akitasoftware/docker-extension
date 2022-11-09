package repo

import (
	"akita/domain/agent"
)

// TODO: Persist the agent config to a file.
type AgentRepository struct {
	agentConfig *agent.Config
}

func NewAgentRepository() agent.Repository {
	return &AgentRepository{}
}

func (a AgentRepository) GetConfig() (*agent.Config, error) {
	return a.agentConfig, nil
}

func (a AgentRepository) CreateConfig(agentConfig *agent.Config) error {
	a.agentConfig = agentConfig
	return nil
}

func (a AgentRepository) RemoveConfig() error {
	a.agentConfig = nil
	return nil
}
