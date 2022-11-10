package ports

import (
	"akita/domain/agent"
	"github.com/labstack/echo"
)

func NewRouter(repository agent.Repository) *echo.Echo {
	handler := newAgentHandler(repository)

	router := echo.New()
	router.HideBanner = true
	router.HTTPErrorHandler = handleError

	router.GET("/agents/config", handler.getAgentConfig)
	router.POST("/agents/config", handler.createAgentConfig)
	router.DELETE("/agents/config", handler.removeAgentConfig)

	return router
}
