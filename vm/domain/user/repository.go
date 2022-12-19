package user

type Repository interface {
	// Returns the Akita user based on the given API credentials.
	GetUser(apiKey string, apiSecret string) (*User, error)
	// Returns true if the given API credentials are valid.
	Exists(apiKey string, apiSecret string) (bool, error)
}
