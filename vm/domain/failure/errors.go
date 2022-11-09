package failure

import (
	"errors"
	"fmt"
)

var ErrInvalid = errors.New("invalid")

// Returns an ErrInvalid error along with the given message.
func Invalidf(format string, a ...interface{}) error {
	return fmt.Errorf("%w: %s", ErrInvalid, fmt.Sprintf(format, a...))
}
