package repo

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AgentRepository struct {
	db *mongo.Database
}

func NewAgentRepository(db *mongo.Database) agent.Repository {
	return &AgentRepository{db: db}
}

func (a AgentRepository) GetConfig(ctx context.Context) (*agent.Config, error) {
	result := a.configCollection().FindOne(ctx, bson.M{})
	if err := result.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, failure.NotFoundf("agent config not found")
		}

		return nil, fmt.Errorf("failed to get agent config: %w", err)
	}

	var config *agent.Config
	if err := result.Decode(&config); err != nil {
		return nil, fmt.Errorf("failed to decode agent config: %w", err)
	}

	return config, nil
}

func (a AgentRepository) SaveConfig(ctx context.Context, agentConfig *agent.Config) error {
	opts := options.Replace().SetUpsert(true)

	// Currently, only one agent config should exist.
	_, err := a.configCollection().ReplaceOne(ctx, bson.M{}, agentConfig, opts)
	if err != nil {
		return fmt.Errorf("failed to create agent config: %w", err)
	}
	return nil
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
