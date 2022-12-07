package app

import "akita/app/handler"

type (
	Handlers struct {
		handler.ManageAgentLifecycle
	}
	App struct {
		Handlers
	}
)
