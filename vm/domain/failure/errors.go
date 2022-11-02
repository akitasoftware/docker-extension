package failure

import (
	"errors"
	"fmt"
)

var ErrInvalid = errors.New("invalid")

func Invalid(err error) error {
	return fmt.Errorf("%w: %v", ErrInvalid, err)
}

func Invalidf(format string, a ...interface{}) error {
	return Invalid(fmt.Errorf(format, a...))
}

func IsInvalidErr(err error) bool {
	return errors.Is(err, ErrInvalid)
}
