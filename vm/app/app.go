package app

import (
	"akita/app/interactor"
	"akita/domain/agent"
	"akita/domain/container"
)

type (
	Interactors struct {
		*interactor.RetrieveAgentConfig
		*interactor.SaveAgentConfig
		*interactor.RemoveAgentConfig
	}
	App struct {
		Interactors
	}
)

func New(agentRepo agent.Repository, containerRepo container.Repository) *App {
	return &App{
		Interactors: Interactors{
			RetrieveAgentConfig: interactor.NewRetrieveAgentConfigInteractor(agentRepo, containerRepo),
			SaveAgentConfig:     interactor.NewSaveAgentConfigInteractor(agentRepo, containerRepo),
			RemoveAgentConfig:   interactor.NewRemoveAgentConfigInteractor(agentRepo),
		},
	}
}
