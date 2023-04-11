package interactor

import (
	"akita/domain/demo"
	"context"
	"fmt"
)

type SendDemoTraffic struct {
	retrieveAgentConfigHandler *RetrieveAgentConfig
	demoRepo                   demo.DemoRepository
}

func NewSendDemoTrafficInteractor(
	retrievalHandler *RetrieveAgentConfig,
	demoRepo demo.DemoRepository,
) *SendDemoTraffic {
	return &SendDemoTraffic{
		retrieveAgentConfigHandler: retrievalHandler,
		demoRepo:                   demoRepo,
	}
}

// Sends demo traffic to the agent.
func (s SendDemoTraffic) Handle(ctx context.Context) error {
	config, err := s.retrieveAgentConfigHandler.Handle(ctx)
	if err != nil {
		return fmt.Errorf("failed to retrieve agent config while checking if demo mode is enabled: %w", err)
	}

	if !config.IsDemoModeEnabled {
		return nil
	}

	err = s.demoRepo.SendMockTraffic()
	if err != nil {
		return fmt.Errorf("failed to send mock traffic to agent: %w", err)
	}

	return nil
}
