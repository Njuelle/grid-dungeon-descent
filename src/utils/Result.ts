/**
 * Result type for handling operations that can succeed or fail
 * Provides a type-safe alternative to throwing exceptions
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
    readonly _tag = "success" as const;

    constructor(public readonly value: T) {}

    isSuccess(): this is Success<T> {
        return true;
    }

    isFailure(): this is Failure<never> {
        return false;
    }

    map<U>(fn: (value: T) => U): Result<U, never> {
        return new Success(fn(this.value));
    }

    flatMap<U, E2>(fn: (value: T) => Result<U, E2>): Result<U, E2> {
        return fn(this.value);
    }
}

export class Failure<E> {
    readonly _tag = "failure" as const;

    constructor(public readonly error: E) {}

    isSuccess(): this is Success<never> {
        return false;
    }

    isFailure(): this is Failure<E> {
        return true;
    }

    map<U>(_fn: (value: never) => U): Result<U, E> {
        return this as any;
    }

    flatMap<U, E2>(_fn: (value: never) => Result<U, E2>): Result<U, E | E2> {
        return this as any;
    }
}

// Helper functions for creating Results
export const success = <T>(value: T): Success<T> => new Success(value);
export const failure = <E>(error: E): Failure<E> => new Failure(error);

// Utility functions
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
    result.isSuccess();

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
    result.isFailure();

/**
 * Unwraps a Result, throwing the error if it's a failure
 * Use sparingly, prefer pattern matching with isSuccess/isFailure
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
    if (result.isSuccess()) {
        return result.value;
    }
    throw result.error;
};

/**
 * Returns the value or a default if the result is a failure
 */
export const getOrDefault = <T, E>(
    result: Result<T, E>,
    defaultValue: T
): T => {
    return result.isSuccess() ? result.value : defaultValue;
};

/**
 * Combines multiple Results into a single Result containing an array
 */
export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const values: T[] = [];

    for (const result of results) {
        if (result.isFailure()) {
            return result;
        }
        values.push(result.value);
    }

    return success(values);
};
