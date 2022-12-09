package config

import (
	"flag"
	"fmt"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/akitasoftware/go-utils/optionals"
	"gopkg.in/yaml.v3"
	"os"
)

type Config struct {
	socketPath string
	analytics  optionals.Optional[analytics.Config]
}

type rawConfig struct {
	Analytics struct {
		// Configures the analytics client.
		analytics.Config `yaml:",inline"`
		// Whether analytics are enabled.
		Enabled bool `yaml:"enabled"`
	} `yaml:"analytics"`
}

func Parse(raw []byte) (*Config, error) {
	var parsedConfig *rawConfig

	if err := yaml.Unmarshal(raw, &parsedConfig); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	analyticsConfig := optionals.Some(parsedConfig.Analytics.Config)
	if !parsedConfig.Analytics.Enabled {
		analyticsConfig = optionals.None[analytics.Config]()
	}

	return &Config{
		socketPath: socketPath,
		analytics:  analyticsConfig,
	}, nil
}

// Returns a analytics client config parsed from the command line flags.
// If no Segment write key was provided, then an empty config and false will be returned.
func (c Config) AnalyticsConfig() (analytics.Config, bool) {
	return c.analytics.Get()
}

func (c Config) SocketPath() string {
	return c.socketPath
}
