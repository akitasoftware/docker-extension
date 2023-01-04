package event

import (
	"akita/domain/failure"
	"encoding/json"
	"io"
)

// Represents an analytics event.
// This will be used to send events from the UI to Segment.
type Event struct {
	Name string `json:"name"`
	// Properties of the event.
	Properties map[string]any `json:"properties"`
}

func Decode(r io.Reader) (*Event, error) {
	var result *Event

	if err := json.NewDecoder(r).Decode(&result); err != nil {
		return nil, failure.Invalidf("failed to decode event: %v", err)
	}

	if err := result.Validate(); err != nil {
		return nil, err
	}

	return result, nil
}

func (e Event) Validate() error {
	if e.Name == "" {
		return failure.Invalidf("event name is missing")
	}

	return nil
}
