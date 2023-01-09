package host

import "context"

type Repository interface {
	// Return the host's TargetPlatform information.
	// If the host is not found, returns a failure.NotFound error.
	GetTargetPlatform(ctx context.Context) (*TargetPlatform, error)
	// Save the host's TargetPlatform information.
	// If a record already exists, it will be overwritten.
	SaveTargetPlatform(context.Context, *TargetPlatform) error
}
