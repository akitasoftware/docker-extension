package interactor

import (
	"akita/domain/host"
	"context"
)

type SaveHostDetails struct {
	hostRepo host.Repository
}

func NewSaveHostDetailsInteractor(hostRepo host.Repository) *SaveHostDetails {
	return &SaveHostDetails{
		hostRepo: hostRepo,
	}
}

// Persists information about the host machine.
// This information is used to label analytic events with the host's OS and architecture.
func (s SaveHostDetails) Handle(ctx context.Context, platform *host.TargetPlatform) error {
	return s.hostRepo.SaveTargetPlatform(ctx, platform)
}
