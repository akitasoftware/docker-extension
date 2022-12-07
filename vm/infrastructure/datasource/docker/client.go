package docker

import (
	"context"
	"fmt"
	"github.com/avast/retry-go"
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

func (c Client) Run(ctx context.Context, opts *RunOptions) error {
	retryableFunc := func() error {
		return c.run(ctx, opts)
	}

	err := retry.Do(retryableFunc, retry.Attempts(opts.maxRetries))
	return err
}

func (c Client) run(ctx context.Context, opts *RunOptions) error {
	reader, err := c.cli.ImagePull(ctx, opts.image, opts.imagePullOptions)
	if err != nil {
		return fmt.Errorf("failed to pull image: %w", err)
	}

	_, _ = io.Copy(os.Stdout, reader)

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
