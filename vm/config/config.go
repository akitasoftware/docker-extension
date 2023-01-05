package config

import (
	"akita/domain/host"
	"flag"
	"fmt"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/akitasoftware/go-utils/optionals"
	"gopkg.in/yaml.v3"
	"os"
)

type Config struct {
	// Path to the unix domain socket to listen on.
	socketPath string
	// The target OS that the VM will run on.
	targetOS string
	// The target architecture that the VM will run on.
	targetArch string
	// The analytics client config.
	// If analytics are disabled, this will be None.
	analytics optionals.Optional[analytics.Config]
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

	socketPath, targetOS, targetArch := parseFlags()
	fmt.Printf("socket path: %s, target OS: %s, target arch: %s\n", socketPath, targetOS, targetArch)

	analyticsConfig := optionals.Some(parsedConfig.Analytics.Config)
	if !parsedConfig.Analytics.Enabled {
		analyticsConfig = optionals.None[analytics.Config]()
	}

	return &Config{
		socketPath: socketPath,
		targetOS:   targetOS,
		targetArch: targetArch,
		analytics:  analyticsConfig,
	}, nil
}

func parseFlags() (socketPath, targetOS, targetArch string) {
	const defaultPlatformValue = "unknown"

	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.StringVar(&targetOS, "os", defaultPlatformValue, "Target OS that the vm will run on")
	flag.StringVar(&targetArch, "arch", defaultPlatformValue, "Target architecture that the vm will run on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	return
}

// Returns a analytics client config parsed from the command line flags.
// If no Segment write key was provided, then an empty config and false will be returned.
func (c Config) AnalyticsConfig() (analytics.Config, bool) {
	return c.analytics.Get()
}

func (c Config) SocketPath() string {
	return c.socketPath
}

// Returns information about the target platform that the VM will run on.
func (c Config) TargetPlatform() *host.TargetPlatform {
	return &host.TargetPlatform{
		OS:   c.targetOS,
		Arch: c.targetArch,
	}
}
