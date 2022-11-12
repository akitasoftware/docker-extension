package main

import (
	"akita/infrastructure/datasource"
	"akita/infrastructure/repo"
	"akita/ports"
	"context"
	"flag"
	"log"
	"net"
	"os"

	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/sirupsen/logrus"
)

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logrus.New().Infof("Starting listening on %s\n", socketPath)

	appCtx := context.Background()

	database, err := datasource.ProvideMongoDB(appCtx)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}

	analyticsClient, err := provideAnalyticsClient()
	if err != nil {
		log.Fatalf("Failed to create analytics client: %v", err)
	}

	agentRepo := repo.NewAgentRepository(database)

	router := ports.NewRouter(agentRepo, analyticsClient)

	startURL := ""

	ln, err := listen(socketPath)
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln

	log.Fatal(router.Start(startURL))
}

func listen(path string) (net.Listener, error) {
	return net.Listen("unix", path)
}

func provideAnalyticsClient() (analytics.Client, error) {
	config := analytics.Config{
		App: analytics.AppInfo{
			Name: "docker-extension",
		},
		DefaultIntegrations: map[string]bool{
			"All":      true,
			"Intercom": false,
		},
		WriteKey: "2sngErDOO1ylbIrPLMN4xFfuUz4DPIJl",
	}

	return analytics.NewClient(config)
}
