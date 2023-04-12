package datasource

import (
	"fmt"

	"github.com/brianvoe/gofakeit/v6"
	"github.com/go-resty/resty/v2"
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
	breedID, err := getRandomBreedID()
	_, err = d.client.
		SetHeader("Accept", "application/json").
		R().Get(fmt.Sprintf("/v1/breeds/%s", breedID))
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
	trickID, err := getRandomTrickID()
	if err != nil {
		return err
	}

	body := fmt.Sprintf(
		`{owner: { id: %s, name: %s, address: %s }, treat_count: %d}`,
		gofakeit.UUID(),
		gofakeit.Name(),
		gofakeit.Address().Address,
		gofakeit.IntRange(0, 10),
	)
	url := fmt.Sprintf("/v1/pets/%s/tricks/%s", gofakeit.UUID(), trickID)

	_, err = d.client.
		SetHeader("Accept", "application/json").
		R().SetBody(body).Post(url)
	if err != nil {
		return err
	}

	return nil
}

func getRandomTrickID() (string, error) {
	tricks := map[string]float32{
		// Gives a 10% chance to cause a 400
		"bb5a4789-8189-4905-a736-682de6a32375": 0.05,
		"69d48609-ac34-4d36-bd7f-46f1207ee80e": 0.05,
		// Gives a 10% chance to cause a 500
		"dc722acb-45e1-4e3e-a926-b186929e6570": 0.05,
		"f2821a1d-b5f6-4a16-a1ed-b78fce03703d": 0.05,
	}

	// For the other 80%, generate random UUID that will produce a 200
	for i := 0; i < 8; i++ {
		tricks[gofakeit.UUID()] = 0.1
	}

	return pickFromWeightedMap(tricks)
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
	// `zeroVal` will be returned if an error occurs
	var zeroVal T

	var keys []interface{}
	var probabilities []float32

	for key, weight := range m {
		keys = append(keys, key)
		probabilities = append(probabilities, weight)
	}

	pickedKey, err := gofakeit.New(0).Weighted(keys, probabilities)
	if err != nil {
		return zeroVal, fmt.Errorf("failed to create faker: %w", err)
	}

	return pickedKey.(T), nil
}
