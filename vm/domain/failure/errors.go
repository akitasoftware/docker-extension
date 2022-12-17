package failure

import (
	"errors"
	"fmt"
)

var (
	ErrInvalid       = errors.New("invalid")
	ErrNotFound      = errors.New("not found")
	ErrUnprocessable = errors.New("unprocessable")
)

// Returns an ErrInvalid error along with the given message.
func Invalidf(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrInvalid, fmt.Sprintf(format, a...))
}

func NotFoundf(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrNotFound, fmt.Sprintf(format, a...))
}

func Unprocessablef(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrUnprocessable, fmt.Sprintf(format, a...))
}
