package ports

import (
	"akita/app"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/labstack/echo"
)

func NewRouter(app *app.App, analyticsClient analytics.Client) *echo.Echo {

	agentHandler := newAgentHandler(app)
	eventHandler := newEventHandler(analyticsClient)

	router := echo.New()
	router.HideBanner = true
	router.HTTPErrorHandler = handleError

	// Config Endpoints
	{
		router.GET("/agents/config", agentHandler.getAgentConfig)
		router.POST("/agents/config", agentHandler.createAgentConfig)
		router.DELETE("/agents/config", agentHandler.removeAgentConfig)
	}

	// Analytics Endpoints
	{
		router.POST("analytics/event", eventHandler.postEvent)
	}

	return router
}
