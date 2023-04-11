package repo

import (
	"akita/domain/demo"
	"akita/infrastructure/datasource"
	"github.com/golang/glog"
)

type (
	demoRepositoryImpl struct {
		demoServer datasource.DemoServer
	}
)

func NewDemoRepository(demoServer datasource.DemoServer) demo.DemoRepository {
	return &demoRepositoryImpl{demoServer: demoServer}
}

func (d demoRepositoryImpl) SendMockTraffic() error {
	// TODO: We should check if this is an error we don't expect and return it.
	err := d.demoServer.GetBreed()
	if err != nil {
		glog.Errorf("failed to send breed request: %v", err)
	}

	err = d.demoServer.PostTrick()
	if err != nil {
		glog.Errorf("failed to send trick request: %v", err)
	}

	err = d.demoServer.GetBreed()
	if err != nil {
		glog.Errorf("failed to send breed request: %v", err)
	}

	return nil
}
