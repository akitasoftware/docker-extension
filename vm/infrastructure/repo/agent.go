package repo

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"akita/infrastructure/datasource"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/spf13/afero"
)

type AgentRepository struct {
}

func NewAgentRepository() *AgentRepository {
	return &AgentRepository{}
}

func (a AgentRepository) GetConfig() (*agent.Config, error) {
	data, err := afero.ReadFile(datasource.FileSystem, datasource.ConfigFilePath)
	if err != nil {
		if errors.Is(err, afero.ErrFileNotFound) {
			return nil, failure.NotFoundf("agent config not found")
		}
		return nil, fmt.Errorf("failed to read agent config: %w", err)
	}

	var result *agent.Config

	if err := json.Unmarshal(data, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal agent config: %w", err)
	}

	return result, nil
}

func (a AgentRepository) CreateConfig(agentConfig *agent.Config) error {
	data, err := json.Marshal(agentConfig)
	if err != nil {
		return fmt.Errorf("failed to marshal agent config: %w", err)
	}

	if err := afero.WriteFile(
		datasource.FileSystem,
		datasource.ConfigFilePath,
		data,
		datasource.OS_USER_RW,
	); err != nil {
		return fmt.Errorf("failed to write agent config: %w", err)
	}

	return nil
}

func (a AgentRepository) RemoveConfig() error {
	if err := datasource.FileSystem.Remove(datasource.ConfigFilePath); err != nil {
		return fmt.Errorf("failed to remove agent config: %w", err)
	}

	return nil
}
