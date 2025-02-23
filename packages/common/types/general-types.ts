/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright albahrawy All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at the root.
 */

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never
type SpreadTwo<L, R> = Id<{ [K in keyof L | keyof R]: K extends keyof L & keyof R ? L[K] & R[K]
    : K extends keyof L ? L[K] : K extends keyof R ? R[K] : never; }>;
type Spread<A extends [...any]> = A extends [infer L, ...infer R] ? SpreadTwo<L, Spread<R>> : unknown;

export type Nullable<T> = T | null | undefined;
export type IRecord<T> = Record<string, T>;
export type IStringRecord = Record<string, string>;
export type IGenericRecord = Record<string, any>;
export type IArray = Array<any>;

export type Constructor<T = any> = new (...args: any[]) => T;
export type IFunc<I, O> = (arg: I) => O;
export type IAction<O = void> = (arg: O) => void;
export type IArglessFunc<O> = () => O;
export type ValueGetter<I, O = string> = Nullable<string | IFunc<I, O>>;

export type MergedObject<T extends [...any]> = Spread<T>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const noopFn = (...args: any[]): any => {/** */ };