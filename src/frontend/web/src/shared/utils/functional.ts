/**
 * Simple functional programming types to avoid heavy dependencies like fp-ts.
 */

// --- OPTION ---
export type Option<T> = { _tag: "Some"; value: T } | { _tag: "None" };

export const some = <T>(value: T): Option<T> => ({ _tag: "Some", value });
export const none = <T>(): Option<T> => ({ _tag: "None" });

export const isSome = <T>(o: Option<T>): o is { _tag: "Some"; value: T } => o._tag === "Some";

// --- RESULT ---
export type Result<T, E> = { _tag: "Success"; data: T } | { _tag: "Failure"; error: E };

export const success = <T, E>(data: T): Result<T, E> => ({ _tag: "Success", data });
export const failure = <T, E>(error: E): Result<T, E> => ({ _tag: "Failure", error });

export const isSuccess = <T, E>(r: Result<T, E>): r is { _tag: "Success"; data: T } => r._tag === "Success";
