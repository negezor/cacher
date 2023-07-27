import { IAdapter, IAdapterTouchOptions } from './adapters';

export type AllowArray<T> = T | T[];

export type Serializer<V> = (value: V) => string;
export type Deserializer<V> = (value: string) => V;

export interface ICacherOptions<V> {
    adapter?: IAdapter;

    namespace: string;

    serializer?: Serializer<V>;
    deserializer?: Deserializer<V>;
}

export interface ICacherGetOptions<K, A> {
    key: K;
    alias?: A;
}

export interface ICacherSetOptions<V> {
    key: string;
    value: V;
    ttl?: number;
}

export interface ICacherIncrementOptions {
    key: string;
    value: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICacherTouchOptions extends IAdapterTouchOptions {}
