package app

import (
	"akita/app/handler"
	"akita/domain/agent"
)

type (
	Handlers struct {
		*handler.ManageAgentLifecycle
		*handler.StoreAgentConfig
		*handler.RemoveAgentConfig
		*handler.GetAgentConfig
	}
	App struct {
		Handlers
	}
)

func NewApp(agentRepo agent.Repository) *App {
	manageAgentHandler := handler.NewManageAgentHandler(agentRepo)

	storeAgentConfigHandler := handler.NewStoreAgentConfig(agentRepo, manageAgentHandler)
	removeAgentConfigHandler := handler.NewRemoveAgentConfigHandler(agentRepo, manageAgentHandler)
	getAgentConfigHandler := handler.NewGetAgentConfigHandler(agentRepo)

	return &App{
		Handlers: Handlers{
			ManageAgentLifecycle: manageAgentHandler,
			StoreAgentConfig:     storeAgentConfigHandler,
			RemoveAgentConfig:    removeAgentConfigHandler,
			GetAgentConfig:       getAgentConfigHandler,
		},
	}
}
