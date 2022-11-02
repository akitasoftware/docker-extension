package ports

import (
	"akita/domain/agent"
	"akita/domain/failure"
	"errors"
	"github.com/labstack/echo"
)

type agentHandler struct {
	agentRepo agent.Repository
}

func newAgentHandler(agentRepo agent.Repository) *agentHandler {
	return &agentHandler{agentRepo: agentRepo}
}

func (a agentHandler) getAgentConfig(ctx echo.Context) error {
	config, err := a.agentRepo.GetConfig()
	if err != nil {
		return err
	}

	return ctx.JSON(200, config)
}

func (a agentHandler) createAgentConfig(ctx echo.Context) error {
	config, err := agent.DecodeConfig(ctx.Request().Body)
	if err != nil {
		return err
	}

	if err := a.agentRepo.CreateConfig(config); err != nil {
		return err
	}

	return ctx.JSON(201, config)
}

func (a agentHandler) removeAgentConfig(ctx echo.Context) error {
	if err := a.agentRepo.RemoveConfig(); err != nil {
		return err
	}

	return ctx.NoContent(204)
}

func handleError(err error, ctx echo.Context) {
	body := map[string]string{
		"errorMessage": err.Error(),
	}

	if errors.Is(err, failure.ErrInvalid) {
		_ = ctx.JSON(400, body)
	} else {
		_ = ctx.JSON(500, body)
	}
}
