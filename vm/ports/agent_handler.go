package ports

import (
	"akita/app"
	"akita/domain/agent"
	"akita/domain/failure"
	"errors"
	"github.com/labstack/echo"
)

type agentHandler struct {
	app *app.App
}

func newAgentHandler(app *app.App) *agentHandler {
	return &agentHandler{app: app}
}

func (a agentHandler) getAgentConfig(ctx echo.Context) error {
	requestContext := ctx.Request().Context()
	config, err := a.app.RetrieveAgentConfig.Handle(requestContext)
	if err != nil {
		return err
	}

	if config == nil {
		return ctx.NoContent(404)
	}

	return ctx.JSON(200, config)
}

func (a agentHandler) createAgentConfig(ctx echo.Context) error {
	config, err := agent.DecodeConfig(ctx.Request().Body)
	if err != nil {
		return err
	}

	requestContext := ctx.Request().Context()

	if err := a.app.SaveAgentConfig.Handle(requestContext, config); err != nil {
		return err
	}

	return ctx.JSON(201, config)
}

func (a agentHandler) removeAgentConfig(ctx echo.Context) error {
	requestContext := ctx.Request().Context()

	if err := a.app.RemoveAgentConfig.Handle(requestContext); err != nil {
		return err
	}

	return ctx.NoContent(200)
}

func handleError(err error, ctx echo.Context) {
	body := map[string]string{
		"errorMessage": err.Error(),
	}

	if errors.Is(err, failure.ErrInvalid) {
		_ = ctx.JSON(400, body)
	} else if errors.Is(err, failure.ErrNotFound) {
		_ = ctx.JSON(404, body)
	} else if errors.Is(err, failure.ErrUnprocessable) {
		_ = ctx.JSON(422, body)
	} else if errors.Is(err, failure.ErrUnauthorized) {
		_ = ctx.JSON(401, body)
	} else {
		_ = ctx.JSON(500, body)
	}
}
