package repo

import (
	"akita/domain/container"
	"akita/infrastructure/datasource/docker"
	"context"
	"github.com/akitasoftware/go-utils/optionals"
	"github.com/docker/docker/api/types/filters"
)

type ContainerRepository struct {
	dockerClient docker.Client
}

func NewContainerRepository(dockerClient docker.Client) container.Repository {
	return &ContainerRepository{dockerClient: dockerClient}
}

func (c ContainerRepository) Exists(
	ctx context.Context,
	id string,
	requiredStatus optionals.Optional[container.Status],
) (bool, error) {
	args := filters.NewArgs()

	args.Add("id", id)
	if status, ok := requiredStatus.Get(); ok {
		args.Add("status", string(status))
	}

	return c.dockerClient.ContainerExists(ctx, docker.ContainerFilterOptions{Filters: args})
}
