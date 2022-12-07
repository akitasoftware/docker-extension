package agent

type State struct {
	ContainerID string `json:"container_id,omitempty"`
	Status      string `json:"status,omitempty"`
	Created     bool   `json:"created"`
}

func (s *State) IsRunning() bool {
	return s.Status == "running"
}
