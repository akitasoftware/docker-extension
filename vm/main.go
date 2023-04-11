package main

import (
	"akita/app"
	"akita/config"
	"akita/infrastructure/datasource"
	"akita/infrastructure/datasource/docker"
	"akita/infrastructure/repo"
	"akita/ports"
	"context"
	_ "embed"
	"github.com/go-resty/resty/v2"
	"github.com/sirupsen/logrus"
	"log"
	"net"
	"time"
)

//go:embed application.yml
var applicationYML []byte

//go:embed stubs.json
var demoServerStubs []byte

func main() {
	appConfig, err := config.Parse(applicationYML)
	if err != nil {
		log.Fatalf("failed to parse config: %v", err)
	}

	logrus.New().Infof("Starting listening on %s\n", appConfig.SocketPath())

	appCtx := context.Background()

	database, err := datasource.ProvideMongoDB(appCtx)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}

	dockerClient, err := docker.NewClient()
	if err != nil {
		log.Fatalf("failed to initialize docker client: %v", err)
	}
	defer dockerClient.Close()

	analyticsClient, err := datasource.ProvideAnalyticsClient(appConfig.AnalyticsConfig())
	if err != nil {
		log.Fatalf("Failed to create analytics client: %v", err)
	}
	defer analyticsClient.Close()

	mockServer, err := datasource.ProvideDemoServer(8080, demoServerStubs)
	if err != nil {
		log.Fatalf("Failed to create mock server: %v", err)
	}

	akitaAPIClient := resty.New().SetBaseURL("https://api.akita.software")

	agentRepo := repo.NewAgentRepository(database)
	containerRepo := repo.NewContainerRepository(dockerClient)
	userRepo := repo.NewUserRepository(akitaAPIClient, analyticsClient)
	hostRepo := repo.NewHostRepository(database)
	demoRepo := repo.NewDemoRepository(mockServer)

	appInstance := app.New(agentRepo, hostRepo, containerRepo, userRepo, demoRepo, analyticsClient)

	err = appInstance.SaveHostDetails.Handle(appCtx, appConfig.TargetPlatform())
	if err != nil {
		log.Fatalf("failed to save host details: %v", err)
	}

	router := ports.NewRouter(appInstance)

	startURL := ""

	ln, err := listen(appConfig.SocketPath())
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln

	handleBackgroundDemoTasks(appCtx, appInstance)

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

// TODO: This doesn't belong here, but it's a convenient place to put it for now.
// This is a demo worker that will send demo traffic to the Akita demo server in the background.
func handleBackgroundDemoTasks(ctx context.Context, app *app.App) {
	// Demo traffic is sent every 10 seconds.
	interval := time.Second * 10

	// Create a channel that sends a value every 10 seconds.
	ticker := time.NewTicker(interval)

	// Run the demo traffic loop in the background.
	go func() {
		for {
			// Wait for the next tick.
			<-ticker.C

			// Send a random breed request to the demo server.
			err := app.Interactors.SendDemoTraffic.Handle(ctx)
			if err != nil {
				logrus.New().Errorf("failed to send breed request: %v", err)
			}
		}
	}()
}
