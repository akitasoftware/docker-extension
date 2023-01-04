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
)

//go:embed application.yml
var applicationYML []byte

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

	akitaAPIClient := resty.New().SetBaseURL("https://api.akita.software")

	agentRepo := repo.NewAgentRepository(database)
	containerRepo := repo.NewContainerRepository(dockerClient)
	userRepo := repo.NewUserRepository(akitaAPIClient, analyticsClient)
	hostRepo := repo.NewHostRepository(database)

	appInstance := app.New(agentRepo, hostRepo, containerRepo, userRepo, analyticsClient)

	err = appInstance.SaveHostDetails.Handle(appCtx, appConfig.TargetPlatform())
	if err != nil {
		log.Fatalf("failed to save host details: %v", err)
	}

	router := ports.NewRouter(appInstance, analyticsClient)

	startURL := ""

	ln, err := listen(appConfig.SocketPath())
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}
