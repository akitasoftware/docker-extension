package failure

import (
	"errors"
	"fmt"
)

var (
	ErrInvalid  = errors.New("invalid")
	ErrNotFound = errors.New("not found")
)

// Returns an ErrInvalid error along with the given message.
func Invalidf(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrInvalid, fmt.Sprintf(format, a...))
}

// Returns an ErrNotFound error along with the given message.
func NotFoundf(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrNotFound, fmt.Sprintf(format, a...))
}
