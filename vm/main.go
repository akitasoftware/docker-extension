package main

import (
	"akita/app"
	"akita/infrastructure/datasource"
	"akita/infrastructure/repo"
	"akita/ports"
	"context"
	"flag"
	"log"
	"net"
	"os"
	"time"

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

	appInstance := app.NewApp(agentRepo)

	router := ports.NewRouter(appInstance, analyticsClient)

	startURL := ""

	errCh := make(chan error)

	ln, err := listen(socketPath)
	if err != nil {
		log.Fatal(err)
	}
	router.Listener = ln

	go func() {
		errCh <- runPeriodicTasks(appCtx, appInstance, time.Minute)
	}()

	go func() {
		errCh <- router.Start(startURL)
	}()

	log.Fatal(<-errCh)
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
		WriteKey:  "2sngErDOO1ylbIrPLMN4xFfuUz4DPIJl",
		BatchSize: 1,
	}

	return analytics.NewClient(config)
}

func runPeriodicTasks(ctx context.Context, app *app.App, interval time.Duration) error {
	agentTicker := time.NewTicker(interval)
	errCh := make(chan error)

	for {
		select {
		case <-agentTicker.C:
			err := app.ManageAgentLifecycle.Handle(ctx)
			if err != nil {
				errCh <- err
			}
		case err := <-errCh:
			log.Printf("Error while running periodic agent task: %v", err)
		case <-ctx.Done():
			return nil
		}
	}
}
