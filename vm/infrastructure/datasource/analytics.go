package datasource

import (
	"github.com/akitasoftware/akita-libs/analytics"
)

func ProvideAnalyticsClient(config analytics.Config, enabled bool) (analytics.Client, error) {
	if !enabled {
		return &disabledAnalyticsClient{}, nil
	}

	return analytics.NewClient(config)
}

// A custom analytics client that does nothing. This is used when no
// configuration for Segment has been provided.
type disabledAnalyticsClient struct {
}

func (d disabledAnalyticsClient) TrackEvent(event *analytics.Event) error {
	return nil
}

func (d disabledAnalyticsClient) Track(distinctID string, name string, properties map[string]any) error {
	return nil
}

func (d disabledAnalyticsClient) Close() error {
	return nil
}
