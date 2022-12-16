package docker

import (
	"akita/domain/failure"
	"context"
	"errors"
	dockertypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	docker "github.com/docker/docker/client"
)

type (
	// Custom Docker client that provides a subset of the Docker API's functionality and additional utility methods.
	Client interface {
		// Returns a list of containers in the docker host.
		ListContainers(ctx context.Context, opts dockertypes.ContainerListOptions) ([]dockertypes.Container, error)
		// Returns a container from the docker host that matches the input filter options.
		// If no container is found, a failure.ErrNotFound error is returned.
		GetContainer(ctx context.Context, opts ContainerFilterOptions) (*dockertypes.Container, error)
		// Returns true if a container exists in the docker host that matches the input filter options.
		// If an error occurs, false is returned along with the error.
		ContainerExists(ctx context.Context, opts ContainerFilterOptions) (bool, error)
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

// Options for methods that filter the list of Docker containers.
type ContainerFilterOptions struct {
	// A list of filters consisting of a key and a value pairs.
	Filters filters.Args
	// A function that returns true if the container should be included in the result.
	Predicate func(dockertypes.Container) bool
}

func (c clientImpl) GetContainer(ctx context.Context, opts ContainerFilterOptions) (*dockertypes.Container, error) {
	containers, err := c.ListContainers(ctx, dockertypes.ContainerListOptions{Filters: opts.Filters})
	if err != nil {
		return nil, err
	}

	if len(containers) == 0 {
		return nil, failure.NotFoundf("no container found matching the given filter options")
	}

	if opts.Predicate == nil {
		return &containers[0], nil
	}

	for _, container := range containers {
		if opts.Predicate(container) {
			return &container, nil
		}
	}

	return nil, failure.NotFoundf("no container found matching the given predicate")
}

func (c clientImpl) ContainerExists(ctx context.Context, opts ContainerFilterOptions) (bool, error) {
	_, err := c.GetContainer(ctx, opts)
	if err != nil {
		if errors.Is(err, failure.ErrNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
