/**
 * Functional utilities for Result type pattern used in API responses.
 * Result = { _tag: "Success"; value: T } | { _tag: "Failure"; error: E }
 */

export type Result<T, E = Error> =
  | {
    data: any; _tag: "Success"; value: T
  }
  | { _tag: "Failure"; error: E };

export function isSuccess<T, E>(result: Result<T, E>): result is { _tag: "Success"; value: T } {
  return result._tag === "Success";
}

export function isFailure<T, E>(result: Result<T, E>): result is { _tag: "Failure"; error: E } {
  return result._tag === "Failure";
}

export function success<T>(value: T): Result<T, never> {
  return { _tag: "Success", value };
}

export function failure<E>(error: E): Result<never, E> {
  return { _tag: "Failure", error };
}