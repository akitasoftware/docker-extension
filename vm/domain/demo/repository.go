package demo

type DemoRepository interface {
	// Send a random request to the demo server.
	SendMockTraffic() error
}
