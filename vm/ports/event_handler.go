package ports

import (
	"akita/app"
	"akita/app/interactor"
	"akita/domain/event"
	"github.com/akitasoftware/go-utils/optionals"
	"github.com/labstack/echo"
)

type eventHandler struct {
	app *app.App
}

func newEventHandler(app *app.App) *eventHandler {
	return &eventHandler{app: app}
}

func (e eventHandler) postEvent(ctx echo.Context) error {
	payload, err := event.Decode(ctx.Request().Body)
	if err != nil {
		return err
	}

	err = e.app.RecordUserAnalytics.Handle(
		ctx.Request().Context(), payload.Name, payload.Properties, interactor.RecordUserAnalyticsOptions{
			UserEmail: optionals.Some(payload.DistinctID),
		},
	)
	if err != nil {
		return err
	}

	return ctx.NoContent(204)
}
