package user

type Repository interface {
	// Returns the Akita user based on the given API credentials.
	GetUser(credentials Credentials) (*User, error)
	// Enqueues an analytics event for the given user.
	EnqueueUserEvent(event *Event) error
}
