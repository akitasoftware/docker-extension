package docker

import (
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
)

type ContainerFilterOptions struct {
	// Filter is a list of filters to process on the containers list.
	Filters filters.Args
	// Predicate is a function that returns true if the container matches
	Predicate func(container types.Container) bool
}
