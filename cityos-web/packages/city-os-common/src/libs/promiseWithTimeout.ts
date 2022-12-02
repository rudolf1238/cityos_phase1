const promiseWithTimeout = <T>(
  promise: Promise<T>,
  timeout: number,
  timeoutError = new Error(`Timeout: Async function did not complete within ${timeout}ms`),
): Promise<T> => {
  let timer: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => {
      reject(timeoutError);
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer !== undefined) window.clearTimeout(timer);
  });
};

export default promiseWithTimeout;
