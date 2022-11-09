package repo

import (
	"akita/domain/agent"
	"akita/domain/failure"
)

// TODO (versilis): This is a temporary solution to store data in memory, but it might be worth it to use a persistent database.
// Docker extensions don't support creating additional volumes, so we can't store data in a file.
type dataStore struct {
	agentConfig *agent.Config
}

type AgentRepository struct {
	dataStore *dataStore
}

func NewAgentRepository() agent.Repository {
	return &AgentRepository{&dataStore{}}
}

func (a AgentRepository) GetConfig() (*agent.Config, error) {
	if a.dataStore.agentConfig == nil {
		return nil, failure.NotFoundf("no agent config found")
	}
	return a.dataStore.agentConfig, nil
}

func (a AgentRepository) CreateConfig(agentConfig *agent.Config) error {
	a.dataStore.agentConfig = agentConfig
	return nil
}

func (a AgentRepository) RemoveConfig() error {
	a.dataStore.agentConfig = nil
	return nil
}
