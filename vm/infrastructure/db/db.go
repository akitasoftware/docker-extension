package db

import (
	"fmt"
	"github.com/hashicorp/go-memdb"
)

const AgentTable = "agent"

// Returns a new MemDB instance.
func New() (*memdb.MemDB, error) {
	db, err := memdb.NewMemDB(createDBSchema())
	if err != nil {
		return nil, fmt.Errorf("failed to create db: %w", err)
	}

	return db, nil
}

func createDBSchema() *memdb.DBSchema {
	schema := &memdb.DBSchema{
		Tables: map[string]*memdb.TableSchema{
			AgentTable: {
				Name: AgentTable,
				Indexes: map[string]*memdb.IndexSchema{
					"api_key": {
						Name:    "api_key",
						Unique:  true,
						Indexer: &memdb.StringFieldIndex{Field: "ApiKey"},
					},
				},
			},
		},
	}

	return schema
}
