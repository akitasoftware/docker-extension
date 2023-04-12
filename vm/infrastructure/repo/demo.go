package repo

import (
	"akita/domain/demo"
	"akita/infrastructure/datasource"
	"math/rand"
	"time"

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
	handleErr := func(apiName string, err error) {
		if err != nil {
			glog.Errorf("failed to send demo request to api '%s': %v", apiName, err)
		}
	}

	// To showcase response count metrics, we should attempt to send requests dispropotionately.
	rand.Seed(time.Now().UnixNano())

	// Generate a random number between 0 and 99
	randomNumber := rand.Intn(100)

	// Make a decision based on the random number
	if randomNumber < 67 {
		err := d.demoServer.GetBreed()
		handleErr("breed", err)
	} else {
		err := d.demoServer.PostTrick()
		handleErr("trick", err)
	}

	return nil
}
