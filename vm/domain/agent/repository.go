package agent

type Repository interface {
	GetConfig() (*Config, error)
	CreateConfig(agentConfig *Config) error
	RemoveConfig() error
}
