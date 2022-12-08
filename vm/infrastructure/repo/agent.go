package repo

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"akita/infrastructure/datasource/docker"
	"context"
	"errors"
	"fmt"
	dockertypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	ContainerName   = "akita-extension-agent"
	ImageName       = "public.ecr.aws/akitasoftware/akita-cli:latest"
	AgentLabelKey   = "akita-extension-agent"
	AgentLabelValue = "true"
)

type AgentRepository struct {
	db           *mongo.Database
	dockerClient *docker.Client
}

func NewAgentRepository(db *mongo.Database, dockerClient *docker.Client) agent.Repository {
	return &AgentRepository{db: db, dockerClient: dockerClient}
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

	err = a.dockerClient.PullImage(ctx, ImageName, dockertypes.ImagePullOptions{})
	if err != nil {
		return fmt.Errorf("failed to pull akita-cli image: %w", err)
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

	cmd := []string{"apidump", fmt.Sprintf("--project=%s", config.ProjectName)}
	if config.TargetPort != nil {
		cmd = append(cmd, fmt.Sprintf(`--filter=port %d`, *config.TargetPort))
	}

	runOpts.WithContainerConfig(
		&container.Config{
			Env: []string{
				fmt.Sprintf("AKITA_API_KEY_ID=%s", config.APIKey),
				fmt.Sprintf("AKITA_API_KEY_SECRET=%s", config.APISecret),
			},
			Labels: map[string]string{
				AgentLabelKey: AgentLabelValue,
			},
			Cmd:   cmd,
			Image: ImageName,
		},
	)

	err = a.dockerClient.Run(ctx, runOpts)
	return err
}

func (a AgentRepository) GetAgentStatus(ctx context.Context) (*agent.State, error) {
	agentContainer, err := a.getAgentContainer(ctx)

	if err != nil {
		if errors.Is(err, failure.ErrNotFound) {
			return &agent.State{}, nil
		}
		return nil, err
	}

	return &agent.State{
		ContainerID: agentContainer.ID,
		Status:      agentContainer.State,
		Created:     true,
	}, nil
}

func (a AgentRepository) RemoveAgent(ctx context.Context) error {
	agentContainer, err := a.getAgentContainer(ctx)
	if err != nil {
		if errors.Is(err, failure.ErrNotFound) {
			return nil
		}
		return err
	}

	return a.dockerClient.RemoveContainer(ctx, agentContainer.ID)
}

func (a AgentRepository) getAgentContainer(ctx context.Context) (*dockertypes.Container, error) {
	return a.dockerClient.GetContainer(
		ctx, docker.ContainerFilterOptions{
			Filters: filters.NewArgs(
				filters.Arg("name", ContainerName),
				filters.Arg("label", AgentLabelKey),
				filters.Arg("ancestor", ImageName),
			),
		},
	)
}

// Returns the collection of agent configs.
func (a AgentRepository) configCollection() *mongo.Collection {
	return a.db.Collection("configs")
}
