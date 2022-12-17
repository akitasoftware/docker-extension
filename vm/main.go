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

	agentRepo := repo.NewAgentRepository(database)
	containerRepo := repo.NewContainerRepository(dockerClient)

	appInstance := app.NewApp(agentRepo, containerRepo)

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
