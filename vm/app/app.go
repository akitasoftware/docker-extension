package app

import (
	"akita/app/interactor"
	"akita/domain/agent"
	"akita/domain/container"
)

type (
	Interactors struct {
		*interactor.RetrieveAgentConfig
	}
	App struct {
		Interactors
	}
)

func NewApp(agentRepo agent.Repository, containerRepo container.Repository) *App {
	return &App{
		Interactors: Interactors{
			RetrieveAgentConfig: interactor.NewRetrieveAgentConfigInteractor(agentRepo, containerRepo),
		},
	}
}
