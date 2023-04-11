package datasource

import (
	"fmt"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/go-resty/resty/v2"
)

var (
	// Represents the possible tricks that can be sent to the demo server with their respective probabilities.
	tricks map[string]float32
	// Represents the possible breeds that can be sent to the demo server with their respective probabilities.
	breeds map[string]float32
)

type (
	DemoServer interface {
		// Send a random breed request to the demo server.
		GetBreed() error
		// Send a random trick request to the demo server.
		PostTrick() error
	}
	demoServerImpl struct {
		client *resty.Client
	}
)

// Creates a new demo server client.
func ProvideDemoServer(port int, configuration []byte) (DemoServer, error) {
	server := &demoServerImpl{
		client: resty.New().SetBaseURL(fmt.Sprintf("http://demo-server:%d", port)),
	}

	return server, server.addConfiguration(configuration)
}

func (d demoServerImpl) GetBreed() error {
	var breedParams []interface{}
	var probabilities []float32
	for breed, weight := range breeds {
		breedParams = append(breedParams, breed)
		probabilities = append(probabilities, weight)
	}

	pick, err := gofakeit.New(0).Weighted(breedParams, probabilities)
	if err != nil {
		return fmt.Errorf("failed to create breed faker: %w", err)
	}

	_, err = d.client.R().Get(fmt.Sprintf("/v1/breed/%s", pick))
	if err != nil {
		return err
	}

	return nil
}

func (d demoServerImpl) PostTrick() error {
	var trickParams []interface{}
	var probabilities []float32
	for trick, weight := range tricks {
		trickParams = append(trickParams, trick)
		probabilities = append(probabilities, weight)
	}

	pickedTrick, err := gofakeit.New(0).Weighted(trickParams, probabilities)
	if err != nil {
		return fmt.Errorf("failed to create trick faker: %w", err)
	}

	body := fmt.Sprintf(
		`{"trick":"%s", owner: {id: %s, name: %s, address: %s}}`,
		pickedTrick,
		gofakeit.UUID(),
		gofakeit.Name(),
		gofakeit.Address().Address,
	)
	url := fmt.Sprintf("/v1/trick/%s", pickedTrick)

	_, err = d.client.R().SetBody(body).Post(url)
	if err != nil {
		return err
	}

	return nil
}

// Adds stubs & mappings to the demo server.
func (d demoServerImpl) addConfiguration(configuration []byte) error {
	_, err := d.client.R().SetBody(configuration).Post("/__admin/mappings/import")
	if err != nil {
		return fmt.Errorf("failed to add configuration to demo server: %w", err)
	}

	return nil
}

func init() {
	tricks = map[string]float32{
		"rollover":  0.3,
		"fetch":     0.1,
		"shake":     0.1,
		"jump":      0.1,
		"spin":      0.1,
		"beg":       0.1,
		"play-dead": 0.1,
		"sit":       0.1,
	}

	breeds = map[string]float32{
		// Will return 200s
		"labrador": 0.2,
		"akita":    0.2,
		"poodle":   0.1,
		"husky":    0.1,
		// Will return a 400
		"sphynx": 0.1,
		// Will return 404s
		gofakeit.Dog(): 0.1,
		gofakeit.Dog(): 0.1,
		gofakeit.Dog(): 0.1,
	}
}
