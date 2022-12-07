package repo

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"akita/infrastructure/datasource/docker"
	"context"
	"fmt"
	"github.com/docker/docker/api/types/container"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	ContainerName = "akita-docker-extension-agent"
	ImageName     = "akitasoftware/cli:latest"
	AgentLabel    = "akita-extension-agent"
)

type AgentRepository struct {
	db           *mongo.Database
	dockerClient *docker.Client
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

func (a AgentRepository) RunAgent(ctx context.Context) error {
	config, err := a.GetConfig(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch agent config used for docker run: %w", err)
	}

	runOpts := docker.NewRunOptions(ImageName, ContainerName).WithMaxRetries(3)

	networkMode := "host"
	if config.TargetContainer != nil {
		networkMode = fmt.Sprintf("container:%s", *config.TargetContainer)
	}

	runOpts.WithHostConfig(
		&container.HostConfig{
			AutoRemove:  true,
			NetworkMode: container.NetworkMode(networkMode),
		},
	)

	cmd := []string{"apidump", fmt.Sprintf(`--project "%s"`, config.ProjectName)}
	if config.TargetPort != nil {
		cmd = append(cmd, fmt.Sprintf(`--filter "port %d"`, *config.TargetPort))
	}

	runOpts.WithContainerConfig(
		&container.Config{
			Env: []string{
				fmt.Sprintf("AKITA_API_KEY=%s", config.APIKey),
				fmt.Sprintf("AKITA_API_KEY_SECRET=%s", config.APISecret),
			},
			Labels: map[string]string{
				AgentLabel: "true",
			},
			Cmd: cmd,
		},
	)

	err = a.dockerClient.Run(ctx, runOpts)
	return err
}

// Returns the collection of agent configs.
func (a AgentRepository) configCollection() *mongo.Collection {
	return a.db.Collection("configs")
}
