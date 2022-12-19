package user

type Repository interface {
	// Returns the Akita user based on the given API credentials.
	GetUser(apiKey string, apiSecret string) (*User, error)
}
