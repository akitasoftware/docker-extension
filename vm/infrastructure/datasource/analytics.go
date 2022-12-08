package datasource

import (
	"akita/config"
	"github.com/akitasoftware/akita-libs/analytics"
)

func ProvideAnalyticsClient(config config.Config) (analytics.Client, error) {
	return analytics.NewClient(
		analytics.Config{
			App: analytics.AppInfo{
				Name: "docker-extension",
			},
			DefaultIntegrations: map[string]bool{
				"All": true,
			},
		},
	)
}

// A custom analytics client that does nothing. This is used when no
// configuration for Segment has been provided.
type disabledAnalyticsClient struct {
}

func (c *disabledAnalyticsClient) TrackEvent(event *analytics.Event) error {
	return nil
}

func (c *disabledAnalyticsClient) Track(event analytics.Event) error {
	return nil
}

func (c *disabledAnalyticsClient) Close() error {
	return nil
}
