package agent

import (
	"akita/domain/failure"
	"akita/domain/user"
	"encoding/json"
	"io"
)

type Config struct {
	APIKey          string  `json:"api_key" bson:"api_key"`
	APISecret       string  `json:"api_secret" bson:"api_secret"`
	ProjectName     string  `json:"project_name" bson:"project_name"`
	TargetPort      *int    `json:"target_port" bson:"target_port"`
	TargetContainer *string `json:"target_container" bson:"target_container"`
	// Indicates whether the agent should be started by the frontend on app startup
	IsEnabled         bool `json:"enabled" bson:"enabled"`
	IsDemoModeEnabled bool `json:"demo_mode_enabled" bson:"demo_mode_enabled"`
}

func DecodeConfig(r io.Reader) (*Config, error) {
	var result *Config

	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return nil, failure.Invalidf("failed to decode agent config: %v", err)
	}

	if err := result.Validate(); err != nil {
		return nil, err
	}

	return result, nil
}

func (a *Config) Credentials() user.Credentials {
	return user.Credentials{
		APIKey:    a.APIKey,
		APISecret: a.APISecret,
	}
}

func (a *Config) Validate() error {
	if a.IsDemoModeEnabled && !a.IsEnabled {
		return failure.Invalidf("demo mode cannot be enabled when the agent is disabled")
	}
	if a.APIKey == "" {
		return failure.Invalidf("api key is missing")
	}

	if a.APISecret == "" {
		return failure.Invalidf("api secret is missing")
	}

	if a.ProjectName == "" {
		return failure.Invalidf("project name is missing")
	}

	return nil
}
