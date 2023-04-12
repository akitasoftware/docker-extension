package app

import (
	"akita/app/interactor"
	"akita/domain/agent"
	"akita/domain/container"
	"akita/domain/demo"
	"akita/domain/host"
	"akita/domain/user"
	"github.com/akitasoftware/akita-libs/analytics"
)

type (
	// Represents all interactions that can be performed within the application.
	Interactors struct {
		*interactor.RetrieveAgentConfig
		*interactor.SaveAgentConfig
		*interactor.RemoveAgentConfig
		*interactor.RecordUserAnalytics
		*interactor.SaveHostDetails
		*interactor.SendDemoTraffic
	}
	// Entry point for application logic and use case interactions.
	App struct {
		Interactors
	}
)

func New(
	agentRepo agent.Repository,
	hostRepo host.Repository,
	containerRepo container.Repository,
	userRepo user.Repository,
	demoRepo demo.DemoRepository,
	analyticsClient analytics.Client,
) *App {
	retrieveAgentInteractor := interactor.NewRetrieveAgentConfigInteractor(agentRepo, containerRepo, userRepo)
	return &App{
		Interactors: Interactors{
			RetrieveAgentConfig: retrieveAgentInteractor,
			SaveAgentConfig:     interactor.NewSaveAgentConfigInteractor(agentRepo, containerRepo, userRepo),
			RemoveAgentConfig:   interactor.NewRemoveAgentConfigInteractor(agentRepo),
			RecordUserAnalytics: interactor.NewRecordUserAnalyticsInteractor(
				analyticsClient,
				hostRepo,
				userRepo,
				agentRepo,
			),
			SaveHostDetails: interactor.NewSaveHostDetailsInteractor(hostRepo),
			SendDemoTraffic: interactor.NewSendDemoTrafficInteractor(retrieveAgentInteractor, demoRepo),
		},
	}
}
