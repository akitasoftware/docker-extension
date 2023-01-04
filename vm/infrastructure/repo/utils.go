package repo

import (
	"akita/domain/failure"
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Gets the first document from the given collection.
// An empty filter is applied to the query.
// If no document is found, failure.ErrNotFound is returned.
// This should only be used for collections that only contain a single document.
func getFirstDocument[T any](ctx context.Context, collection *mongo.Collection) (*T, error) {
	var target T

	result := collection.FindOne(ctx, bson.M{})
	if err := result.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, failure.NotFoundf("failed to retrieve document from collection %s: %s", collection.Name(), err)
		}
	}

	if err := result.Decode(&target); err != nil {
		return nil, fmt.Errorf("failed to decode document from collection %s: %w", collection.Name(), err)
	}

	return &target, nil
}

// Updates the first document found in the given collection or inserts a new one if no document is found.
// An empty filter is applied to the query.
// This should only be used for collections that only contain single document.
func upsertFirstDocument[T any](ctx context.Context, collection *mongo.Collection, value T) error {
	opts := options.Replace().SetUpsert(true)

	_, err := collection.ReplaceOne(ctx, bson.M{}, value, opts)
	if err != nil {
		return fmt.Errorf("failed to upsert document into collection %s: %w", collection.Name(), err)
	}
	return nil
}
