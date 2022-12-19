package repo

import (
	"akita/domain/failure"
	"akita/domain/user"
	"fmt"
	"github.com/akitasoftware/akita-libs/analytics"
	"github.com/go-resty/resty/v2"
)

type UserRepository struct {
	restyClient     *resty.Client
	analyticsClient analytics.Client
}

func NewUserRepository(httpClient *resty.Client, analyticsClient analytics.Client) *UserRepository {
	return &UserRepository{
		restyClient:     httpClient,
		analyticsClient: analyticsClient,
	}
}

func (u UserRepository) GetUser(credentials user.Credentials) (*user.User, error) {
	const path = "/v1/user"

	var result user.User

	response, err := u.restyClient.R().SetBasicAuth(
		credentials.APIKey,
		credentials.APISecret,
	).SetResult(&result).Get(path)
	if err != nil {
		if response != nil && response.StatusCode() == 401 {
			return nil, failure.Unauthorizedf("no user found with the given API key and secret")
		}
		return nil, fmt.Errorf("failed to fetch Akita user: %w", err)
	}

	return &result, nil
}

func (u UserRepository) EnqueueUserEvent(event *user.Event) error {
	fetchedUser, err := u.GetUser(event.Credentials)
	if err != nil {
		return err
	}

	return u.analyticsClient.Track(fetchedUser.Email, event.Name, event.Properties)
}
