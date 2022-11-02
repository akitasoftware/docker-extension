package repo

import (
	"akita/domain/agent"
	"akita/infrastructure/db"
	"fmt"
	"github.com/hashicorp/go-memdb"
)

type AgentRepository struct {
	db *memdb.MemDB
}

func NewAgentRepository(db *memdb.MemDB) *AgentRepository {
	return &AgentRepository{db: db}
}

func (a AgentRepository) GetConfig() (*agent.Config, error) {
	txn := a.db.Txn(false)

	raw, err := txn.First(db.AgentTable, "api_key")
	if err != nil {
		return nil, fmt.Errorf("failed to get agent config: %w", err)
	}

	return raw.(*agent.Config), nil
}

func (a AgentRepository) CreateConfig(agentConfig *agent.Config) error {
	txn := a.db.Txn(true)

	if err := txn.Insert(db.AgentTable, agentConfig); err != nil {
		txn.Abort()
		return fmt.Errorf("failed to create agent config: %w", err)
	}

	txn.Commit()
	return nil
}

func (a AgentRepository) RemoveConfig() error {
	txn := a.db.Txn(true)

	if _, err := txn.DeleteAll(db.AgentTable, "api_key"); err != nil {
		txn.Abort()
		return fmt.Errorf("failed to remove agent config: %w", err)
	}

	txn.Commit()
	return nil
}
