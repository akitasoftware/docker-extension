package datasource

import (
	"github.com/spf13/afero"
	"log"
)

const (
	OS_READ       = 04
	OS_WRITE      = 02
	OS_USER_SHIFT = 6

	OS_USER_R  = OS_READ << OS_USER_SHIFT
	OS_USER_W  = OS_WRITE << OS_USER_SHIFT
	OS_USER_RW = OS_USER_R | OS_USER_W
)

const (
	ConfigFilePath = "/config.json"
)

var FileSystem = afero.NewOsFs()

func init() {
	const (
		volumePath = "/data"
		baseDir    = volumePath + "/backend"
	)

	if ok, err := afero.DirExists(FileSystem, volumePath); err != nil {
		log.Fatalf("failed to check if volume path exists: %v", err)
	} else if !ok {
		log.Fatal("directory /data does not exist")
	}

	if err := FileSystem.Mkdir(baseDir, OS_USER_RW); err != nil {
		log.Fatalf("failed to create base directory %s: %v", baseDir, err)
	}

	FileSystem = afero.NewBasePathFs(FileSystem, baseDir)
}
