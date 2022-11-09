package repo

import (
	"akita/domain/agent"
)

var currAgentConfig *agent.Config = nil

type AgentRepository struct {
}

func NewAgentRepository() *AgentRepository {
	return &AgentRepository{}
}

func (a AgentRepository) GetConfig() (*agent.Config, error) {
	return currAgentConfig, nil
}

func (a AgentRepository) CreateConfig(agentConfig *agent.Config) error {
	currAgentConfig = agentConfig
	return nil
}

func (a AgentRepository) RemoveConfig() error {
	currAgentConfig = nil
	return nil
}
