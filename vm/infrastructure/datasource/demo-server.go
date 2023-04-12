package datasource

import (
	"fmt"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/go-resty/resty/v2"
	"github.com/google/uuid"
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
	_, err := d.client.R().Get(fmt.Sprintf("/v1/breeds/%s", getRandomBreedID()))
	if err != nil {
		return err
	}

	return nil
}

func getRandomBreedID() (string, error) {
	breeds := map[string]float32{
		// Gives a 20% chance of returning a 404
		"4e7bde8a-92a6-4a4a-a1e9-5547537e90f7": 0.05,
		"33f9889c-e4aa-4ef4-ba2d-560c1048bc9b": 0.05,
		"dcd6b113-19a1-41af-8037-84c02951b990": 0.05,
		"09348399-fb03-4fcc-9a4b-a1eaf796bd75": 0.05,
	}

	// For the other 80%, generate a random UUID (which will cause the demo server to return a 200)
	for i := 0; i < 8; i++ {
		breeds[gofakeit.UUID()] = 0.1
	}

	return pickFromWeightedMap(breeds)
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
	url := fmt.Sprintf("/v1/tricks/%s", pickedTrick)

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

func pickFromWeightedMap[T comparable](m map[T]float32) (T, error) {
	var keys []T
	var probabilities []float32

	for key, weight := range m {
		keys = append(keys, key)
		probabilities = append(probabilities, weight)
	}

	pickedKey, err := gofakeit.New(0).Weighted(keys, probabilities)
	if err != nil {
		return nil, fmt.Errorf("failed to create faker: %w", err)
	}

	return pickedKey, nil
})

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
