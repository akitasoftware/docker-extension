package interactor

import (
	"akita/domain/agent"
	"akita/domain/host"
	"akita/domain/user"
	"context"
	"fmt"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/akitasoftware/go-utils/optionals"
)

type RecordUserAnalytics struct {
	analyticsClient analytics.Client
	hostRepo        host.Repository
	userRepo        user.Repository
	agentRepo       agent.Repository
}

func NewRecordUserAnalyticsInteractor(
	analyticsClient analytics.Client,
	hostRepo host.Repository,
	userRepo user.Repository,
	agentRepo agent.Repository,
) *RecordUserAnalytics {
	return &RecordUserAnalytics{
		analyticsClient: analyticsClient,
		hostRepo:        hostRepo,
		userRepo:        userRepo,
		agentRepo:       agentRepo,
	}
}

type RecordUserAnalyticsOptions struct {
	// The target platform of the host. If not provided, the data will be fetched from storage.
	TargetPlatform optionals.Optional[*host.TargetPlatform]
	// The user's email. If not provided, the data will be fetched from the Akita API
	UserEmail optionals.Optional[string]
}

func (r RecordUserAnalytics) Handle(
	ctx context.Context,
	eventName string,
	properties map[string]any,
	options RecordUserAnalyticsOptions,
) error {
	var err error

	targetPlatform, ok := options.TargetPlatform.Get()
	if !ok {
		// Fetch the platform from storage.
		targetPlatform, err = r.hostRepo.GetTargetPlatform(ctx)
		if err != nil {
			return err
		}
	}

	distinctID, ok := options.UserEmail.Get()
	if !ok {
		// Fetch the user's email from the Akita API.
		agentConfig, err := r.agentRepo.GetConfig(ctx)
		if err != nil {
			return err
		}
		userResult, err := r.userRepo.GetUser(agentConfig.Credentials())
		if err != nil {
			return err
		}
		distinctID = userResult.Email
	}

	properties["target-os"] = targetPlatform.OS
	properties["target-arch"] = targetPlatform.Arch

	err = r.analyticsClient.TrackEvent(analytics.NewEvent(distinctID, eventName, properties))
	if err != nil {
		return fmt.Errorf("failed to record analytics event: %w", err)
	}

	return nil
}
