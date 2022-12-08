package docker

import (
	"akita/domain/failure"
	"context"
	"errors"
	"fmt"
	"github.com/avast/retry-go"
	"github.com/docker/docker/api/types"
	docker "github.com/docker/docker/client"
	"io"
	"os"
)

type Client struct {
	cli *docker.Client
}

func NewClient() (*Client, error) {
	cli, err := docker.NewClientWithOpts(docker.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &Client{cli: cli}, nil
}

func (c Client) RemoveContainer(ctx context.Context, containerID string) error {
	return c.cli.ContainerRemove(
		ctx, containerID, types.ContainerRemoveOptions{
			Force: true,
		},
	)
}

func (c Client) ListContainers(ctx context.Context, opts types.ContainerListOptions) ([]types.Container, error) {
	return c.cli.ContainerList(ctx, opts)
}

func (c Client) GetContainer(
	ctx context.Context,
	opts ContainerFilterOptions,
) (*types.Container, error) {
	containers, err := c.ListContainers(
		ctx, types.ContainerListOptions{
			All:     true,
			Filters: opts.Filters,
		},
	)
	if err != nil {
		return nil, err
	}

	if len(containers) == 0 {
		return nil, failure.NotFoundf("container not found")
	}

	if opts.Predicate == nil {
		return &containers[0], nil
	}

	for _, container := range containers {
		if opts.Predicate(container) {
			return &container, nil
		}
	}

	return nil, failure.NotFoundf("no container found matching the specified predicate")
}

func (c Client) ContainerExists(
	ctx context.Context,
	opts ContainerFilterOptions,
) (bool, error) {
	_, err := c.GetContainer(ctx, opts)
	if err != nil {
		if errors.Is(err, failure.ErrNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (c Client) PullImage(ctx context.Context, image string, opts types.ImagePullOptions) error {
	reader, err := c.cli.ImagePull(ctx, image, opts)
	if err != nil {
		return err
	}

	_, _ = io.Copy(os.Stdout, reader)

	return nil
}

func (c Client) Run(ctx context.Context, opts *RunOptions) error {
	retryableFunc := func() error {
		return c.run(ctx, opts)
	}

	err := retry.Do(retryableFunc, retry.Attempts(opts.maxRetries))
	return err
}

func (c Client) run(ctx context.Context, opts *RunOptions) error {
	resp, err := c.cli.ContainerCreate(
		ctx,
		opts.containerConfig,
		opts.hostConfig,
		opts.networkingConfig,
		opts.platform,
		opts.containerName,
	)
	if err != nil {
		return fmt.Errorf("failed to create container: %w", err)
	}

	if err = c.cli.ContainerStart(ctx, resp.ID, opts.containerStartOptions); err != nil {
		return fmt.Errorf("failed to start container: %w", err)
	}

	return nil
}

func (c Client) Close() error {
	return c.cli.Close()
}
