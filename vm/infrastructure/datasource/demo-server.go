package datasource

import (
	"fmt"
	"github.com/go-resty/resty/v2"
)

type DemoServer struct {
	Client *resty.Client
}

// Creates a new demo server client.
func ProvideDemoServer(port int) *DemoServer {
	return &DemoServer{
		Client: resty.New().SetBaseURL(fmt.Sprintf("http://demo-server:%d", port)),
	}
}
