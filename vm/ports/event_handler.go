package ports

import (
	"akita/domain/event"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/labstack/echo"
)

type eventHandler struct {
	analyticsClient analytics.Client
}

func newEventHandler(analyticsClient analytics.Client) *eventHandler {
	return &eventHandler{analyticsClient: analyticsClient}
}

func (e eventHandler) postEvent(ctx echo.Context) error {
	payload, err := event.Decode(ctx.Request().Body)
	if err != nil {
		return err
	}

	err = e.analyticsClient.TrackEvent(e.mapAnalyticsEvent(payload))
	if err != nil {
		return err
	}

	return ctx.NoContent(204)
}

func (e eventHandler) mapAnalyticsEvent(eventPayload *event.Event) *analytics.Event {
	return analytics.NewEvent(eventPayload.DistinctID, eventPayload.Name, eventPayload.Properties)
}
