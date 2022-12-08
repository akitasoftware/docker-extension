package main

import (
	"akita/config"
	"akita/infrastructure/datasource"
	"akita/infrastructure/repo"
	"akita/ports"
	"context"
	"log"
	"net"
	"os"

	"github.com/sirupsen/logrus"
)

func main() {
	appConfig := config.Parse()

	_ = os.RemoveAll(appConfig.SocketPath())

	logrus.New().Infof("Starting listening on %s\n", appConfig.SocketPath())

	appCtx := context.Background()

	database, err := datasource.ProvideMongoDB(appCtx)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}

	analyticsClient, err := datasource.ProvideAnalyticsClient(appConfig.AnalyticsConfig())
	if err != nil {
		log.Fatalf("Failed to create analytics client: %v", err)
	}

	defer analyticsClient.Close()

	agentRepo := repo.NewAgentRepository(database)

	router := ports.NewRouter(agentRepo, analyticsClient)

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
