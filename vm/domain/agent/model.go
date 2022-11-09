package agent

import (
	"akita/domain/failure"
	"encoding/json"
	"io"
)

type Config struct {
	APIKey          string  `json:"api_key"`
	APISecret       string  `json:"api_secret"`
	ProjectName     string  `json:"project_name"`
	TargetPort      *string `json:"target_port"`
	TargetContainer *string `json:"target_container"`
}

func DecodeConfig(r io.Reader) (*Config, error) {
	var result *Config

	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return nil, failure.Invalid(err)
	}

	if err := result.Validate(); err != nil {
		return nil, err
	}

	return result, nil
}

func (a *Config) Validate() error {
	if a.APIKey == "" {
		return failure.Invalidf("api key is missing")
	}

	if a.APISecret == "" {
		return failure.Invalidf("api secret is missing")
	}

	if a.ProjectName == "" {
		return failure.Invalidf("project name is missing")
	}

	if a.TargetPort == nil && a.TargetContainer == nil {
		return failure.Invalidf("target port and container are missing")
	}

	return nil
}
