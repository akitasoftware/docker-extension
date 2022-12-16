package container

import (
	"context"
	"github.com/akitasoftware/go-utils/optionals"
)

type Repository interface {
	// Checks for the existence of a container with the given ID.
	// If the requiredStatus parameter is provided, the container must also be in the given state.
	Exists(ctx context.Context, id string, requiredStatus optionals.Optional[Status]) (bool, error)
}
