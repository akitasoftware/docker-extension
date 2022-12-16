package docker

import (
	"context"
	dockertypes "github.com/docker/docker/api/types"
	docker "github.com/docker/docker/client"
)

type (
	// Custom Docker client that provides a subset of the Docker API's functionality and additional utility methods.
	Client interface {
		ListContainers(ctx context.Context, opts dockertypes.ContainerListOptions) ([]dockertypes.Container, error)
	}
	clientImpl struct {
		cli *docker.Client
	}
)

func NewClient() (Client, error) {
	cli, err := docker.NewClientWithOpts(docker.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &clientImpl{cli: cli}, nil
}

func (c clientImpl) ListContainers(
	ctx context.Context,
	opts dockertypes.ContainerListOptions,
) ([]dockertypes.Container, error) {
	return c.cli.ContainerList(ctx, opts)
}
