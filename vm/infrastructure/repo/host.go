package repo

import (
	"akita/domain/host"
	"context"
	"go.mongodb.org/mongo-driver/mongo"
)

type HostRepository struct {
	db *mongo.Database
}

func NewHostRepository(db *mongo.Database) HostRepository {
	return HostRepository{db: db}
}

func (h HostRepository) GetTargetPlatform(ctx context.Context) (*host.TargetPlatform, error) {
	return getFirstDocument[host.TargetPlatform](ctx, h.hostCollection())
}

func (h HostRepository) SaveTargetPlatform(ctx context.Context, platform *host.TargetPlatform) error {
	return upsertFirstDocument(ctx, h.hostCollection(), platform)
}

func (h HostRepository) hostCollection() *mongo.Collection {
	return h.db.Collection("hosts")
}
