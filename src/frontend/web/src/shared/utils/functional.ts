/**
 * Simple functional programming types to avoid heavy dependencies like fp-ts.
 */

// --- OPTION ---
export type Option<T> = { _tag: "Some"; value: T } | { _tag: "None" };

export const some = <T>(value: T): Option<T> => ({ _tag: "Some", value });
export const none = <T>(): Option<T> => ({ _tag: "None" });

export const isSome = <T>(o: Option<T>): o is { _tag: "Some"; value: T } => o._tag === "Some";
export const isNone = <T>(o: Option<T>): o is { _tag: "None" } => o._tag === "None";

export const foldOption = <T, R>(
  onNone: () => R,
  onSome: (value: T) => R
) => (o: Option<T>): R => (isSome(o) ? onSome(o.value) : onNone());

// --- RESULT ---
export type Result<T, E> = { _tag: "Success"; data: T } | { _tag: "Failure"; error: E };

export const success = <T, E>(data: T): Result<T, E> => ({ _tag: "Success", data });
export const failure = <T, E>(error: E): Result<T, E> => ({ _tag: "Failure", error });

export const isSuccess = <T, E>(r: Result<T, E>): r is { _tag: "Success"; data: T } => r._tag === "Success";
export const isFailure = <T, E>(r: Result<T, E>): r is { _tag: "Failure"; error: E } => r._tag === "Failure";

export const foldResult = <T, E, R>(
  onFailure: (error: E) => R,
  onSuccess: (data: T) => R
) => (r: Result<T, E>): R => (isSuccess(r) ? onSuccess(r.data) : onFailure(r.error));
