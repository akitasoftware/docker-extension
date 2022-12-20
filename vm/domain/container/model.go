package container

// Represents the current state of a Docker container.
type Status string

const (
	StatusCreated    Status = "created"
	StatusRestarting Status = "restarting"
	StatusRunning    Status = "running"
	StatusRemoving   Status = "removing"
	StatusPaused     Status = "paused"
	StatusExited     Status = "exited"
	StatusDead       Status = "dead"
)
