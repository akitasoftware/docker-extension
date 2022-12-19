package user

import (
	"akita/domain/failure"
	"github.com/akitasoftware/akita-libs/akid"
	"time"
)

// Represents a user of the Akita platform.
type User struct {
	// Unique ID of the organization that the user belongs to.
	OrganizationID akid.OrganizationID `json:"organization_id"`
	Name           string              `json:"name"`
	Email          string              `json:"email"`
	CreatedAt      time.Time           `json:"created_at"`
}

// Represents Akita user credentials.
type Credentials struct {
	APIKey    string
	APISecret string
}

// A user analytics event.
type Event struct {
	// The credentials used to identify the user.
	Credentials Credentials
	// The name of the event.
	Name string `json:"name"`
	// Properties of the event.
	Properties map[string]any `json:"properties"`
}

func NewEvent(credentials Credentials, name string, properties map[string]any) *Event {
	return &Event{Credentials: credentials, Name: name, Properties: properties}
}

func (e Event) Validate() error {
	if e.Name == "" {
		return failure.Invalidf("event name is missing")
	}

	return nil
}
