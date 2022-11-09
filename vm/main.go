package main

import (
	"akita/infrastructure/db"
	"akita/infrastructure/repo"
	"akita/ports"
	"flag"
	"log"
	"net"
	"os"

	"github.com/sirupsen/logrus"
)

func main() {
	var socketPath string
	flag.StringVar(&socketPath, "socket", "/run/guest/volumes-service.sock", "Unix domain socket to listen on")
	flag.Parse()

	_ = os.RemoveAll(socketPath)

	logrus.New().Infof("Starting listening on %s\n", socketPath)

	memDB, err := db.New()
	if err != nil {
		log.Fatal(err)
	}

	agentRepo := repo.NewAgentRepository(memDB)

	router := ports.NewRouter(agentRepo)
	router.HideBanner = true

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
