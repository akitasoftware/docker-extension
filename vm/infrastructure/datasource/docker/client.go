package docker

import docker "github.com/docker/docker/client"

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
