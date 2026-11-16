/** Business errors carry their HTTP status and a stable code; the filter translates them in one place. */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 422,
  ) {
    super(message);
  }
}
