package config

import (
	"flag"
	"github.com/akitasoftware/akita-libs/analytics"
)

type Config struct {
	// The unix domain socket the server will listen on.
	socketPath string
	// The Segment write key used to send events to Segment.
	// If this is empty, then Segment will not be used.
	segmentWriteKey string
}

func Parse() *Config {
	var (
		socketPath      string
		segmentWriteKey string
	)

	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.StringVar(&segmentWriteKey, "segment-write-key", "", "Segment write key")
	flag.Parse()

	return &Config{
		socketPath:      socketPath,
		segmentWriteKey: segmentWriteKey,
	}
}

func (c Config) SocketPath() string {
	return c.socketPath
}

// Returns a analytics client config parsed from the command line flags.
// If no Segment write key was provided, then an empty config and false will be returned.
func (c Config) AnalyticsConfig() (analytics.Config, bool) {
	if !c.isAnalyticsEnabled() {
		return analytics.Config{}, false
	}

	return analytics.Config{
		App: analytics.AppInfo{
			Name: "docker-extension",
		},
		DefaultIntegrations: map[string]bool{
			"All": true,
		},
	}, true
}

func (c Config) isAnalyticsEnabled() bool {
	return c.segmentWriteKey != ""
}
