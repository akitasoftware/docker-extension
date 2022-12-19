package app

import (
	"akita/app/interactor"
	"akita/domain/agent"
	"akita/domain/container"
	"akita/domain/user"
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

func New(agentRepo agent.Repository, containerRepo container.Repository, userRepo user.Repository) *App {
	return &App{
		Interactors: Interactors{
			RetrieveAgentConfig: interactor.NewRetrieveAgentConfigInteractor(agentRepo, containerRepo, userRepo),
			SaveAgentConfig:     interactor.NewSaveAgentConfigInteractor(agentRepo, containerRepo, userRepo),
			RemoveAgentConfig:   interactor.NewRemoveAgentConfigInteractor(agentRepo),
		},
	}
}
