package interactor

import (
	"akita/domain/agent"
	"akita/domain/host"
	"akita/domain/user"
	"context"
	"fmt"
	"github.com/akitasoftware/akita-libs/analytics"
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

func (r RecordUserAnalytics) Handle(ctx context.Context, eventName string, properties map[string]any) error {
	var (
		platform    *host.TargetPlatform
		agentConfig *agent.Config
		userResult  *user.User
	)

	platform, err := r.hostRepo.GetTargetPlatform(ctx)
	if err != nil {
		return fmt.Errorf("failed to get target platform: %w", err)
	}

	agentConfig, err = r.agentRepo.GetConfig(ctx)
	if err != nil {
		return fmt.Errorf("failed to get agent config: %w", err)
	}

	userResult, err = r.userRepo.GetUser(agentConfig.Credentials())
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	properties["target-os"] = platform.OS
	properties["target-arch"] = platform.Arch

	err = r.analyticsClient.TrackEvent(analytics.NewEvent(userResult.Email, eventName, properties))
	if err != nil {
		return fmt.Errorf("failed to record analytics event: %w", err)
	}

	return nil
}
