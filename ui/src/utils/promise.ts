const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

export const retryPromise = <T>(
  executor: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> =>
  executor().catch((err) => {
    const attemptsLeft = maxRetries - 1;
    if (attemptsLeft == 0) {
      return Promise.reject(err);
    }

    return wait(delay).then(() => retryPromise(executor, attemptsLeft, delay));
  });
