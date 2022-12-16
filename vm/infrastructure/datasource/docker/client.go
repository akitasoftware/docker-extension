package docker

import (
	"context"
	dockertypes "github.com/docker/docker/api/types"
	docker "github.com/docker/docker/client"
)

type Client struct {
	cli *docker.Client
}

func NewClient() (*Client, error) {
	cli, err := docker.NewClientWithOpts(docker.FromEnv)
	if err != nil {
		return nil, err
	}

	return &Client{cli: cli}, nil
}

func (c Client) ListContainers(
	ctx context.Context,
	opts dockertypes.ContainerListOptions,
) ([]dockertypes.Container, error) {
	return c.cli.ContainerList(ctx, opts)
}
