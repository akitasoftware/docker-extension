package docker

import (
	dockertypes "github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	specs "github.com/opencontainers/image-spec/specs-go/v1"
)

type RunOptions struct {
	image                 string
	containerName         string
	containerStartOptions dockertypes.ContainerStartOptions
	containerConfig       *container.Config
	hostConfig            *container.HostConfig
	networkingConfig      *network.NetworkingConfig
	platform              *specs.Platform
	maxRetries            uint
}

func NewRunOptions(image string, containerName string) *RunOptions {
	return &RunOptions{
		image:         image,
		containerName: containerName,
		containerConfig: &container.Config{
			Image: image,
		},
		maxRetries: 1,
	}
}

func (ro *RunOptions) WithContainerStartOptions(opts dockertypes.ContainerStartOptions) *RunOptions {
	ro.containerStartOptions = opts
	return ro
}

func (ro *RunOptions) WithContainerConfig(config *container.Config) *RunOptions {
	ro.containerConfig = config
	return ro
}

func (ro *RunOptions) WithHostConfig(config *container.HostConfig) *RunOptions {
	ro.hostConfig = config
	return ro
}

func (ro *RunOptions) WithNetworkingConfig(config *network.NetworkingConfig) *RunOptions {
	ro.networkingConfig = config
	return ro
}

func (ro *RunOptions) WithPlatform(platform *specs.Platform) *RunOptions {
	ro.platform = platform
	return ro
}

func (ro *RunOptions) WithMaxRetries(maxRetries uint) *RunOptions {
	ro.maxRetries = maxRetries
	return ro
}
