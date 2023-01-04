package host

// Represents platform-specific information about a host that is running the VM.
type TargetPlatform struct {
	// The operating system of the target platform.
	OS string `bson:"os"`
	// The architecture of the target platform.
	Arch string `bson:"arch"`
}
