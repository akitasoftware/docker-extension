package datasource

import (
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/labstack/gommon/log"
)

func ProvideAnalyticsClient(config analytics.Config, enabled bool) (analytics.Client, error) {
	if !enabled {
		log.Infof("No Segment write key provided, analytics will be disabled")
		return &disabledAnalyticsClient{}, nil
	}

	return analytics.NewClient(config)
}

// A custom analytics client that does nothing. This is used when no
// configuration for Segment has been provided.
type disabledAnalyticsClient struct {
}

func (d disabledAnalyticsClient) TrackEvent(*analytics.Event) error {
	return nil
}

func (d disabledAnalyticsClient) Track(string, string, map[string]any) error {
	return nil
}

func (d disabledAnalyticsClient) Close() error {
	return nil
}
