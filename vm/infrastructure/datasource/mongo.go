package datasource

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

func ProvideMongoDB(ctx context.Context) (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://akita-db:27017"))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to mongo: %w", err)
	}

	return client.Database("akitaExtension"), nil
}
