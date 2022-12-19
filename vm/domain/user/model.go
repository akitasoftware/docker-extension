package user

import (
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
