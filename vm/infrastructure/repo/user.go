package repo

import (
	"akita/domain/failure"
	"akita/domain/user"
	"errors"
	"fmt"
	"github.com/go-resty/resty/v2"
)

type UserRepository struct {
	client *resty.Client
}

func NewUserRepository(httpClient *resty.Client) *UserRepository {
	return &UserRepository{
		client: httpClient,
	}
}

func (u UserRepository) GetUser(apiKey string, apiSecret string) (*user.User, error) {
	const path = "/api/v1/user"

	var result user.User

	response, err := u.client.R().SetBasicAuth(apiKey, apiSecret).SetResult(&result).Get(path)
	if err != nil {
		if response != nil && response.StatusCode() == 401 {
			return nil, failure.NotFoundf("no user found with the given API key and secret")
		}
		return nil, fmt.Errorf("failed to fetch Akita user: %w", err)
	}

	return &result, nil
}

func (u UserRepository) Exists(apiKey string, apiSecret string) (bool, error) {
	_, err := u.GetUser(apiKey, apiSecret)
	if err != nil {
		if errors.Is(err, failure.ErrNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
