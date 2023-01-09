package repo

import (
	"akita/domain/agent"
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type AgentRepository struct {
	db *mongo.Database
}

func NewAgentRepository(db *mongo.Database) agent.Repository {
	return &AgentRepository{db: db}
}

func (a AgentRepository) GetConfig(ctx context.Context) (*agent.Config, error) {
	return getFirstDocument[agent.Config](ctx, a.configCollection())
}

func (a AgentRepository) SaveConfig(ctx context.Context, agentConfig *agent.Config) error {
	return upsertFirstDocument(ctx, a.configCollection(), agentConfig)
}

func (a AgentRepository) DeleteConfig(ctx context.Context) error {
	_, err := a.configCollection().DeleteMany(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to remove agent config: %w", err)
	}
	return nil
}

// Returns the collection of agent configs.
func (a AgentRepository) configCollection() *mongo.Collection {
	return a.db.Collection("configs")
}
