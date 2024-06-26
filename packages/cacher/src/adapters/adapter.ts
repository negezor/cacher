export interface IAdapterSetOptions {
    key: string;
    value: string;
    ttl?: number;
}

export interface IAdapterTouchOptions {
    key: string;
    ttl: number;
}

export interface IAdapterIncrementOptions {
    key: string;
    value: number;
}

export interface IAdapter {
    get(keys: string[]): Promise<(string | undefined)[]>;

    set(keys: IAdapterSetOptions[]): Promise<void>;

    increment(keys: IAdapterIncrementOptions[]): Promise<(number | undefined)[]>;

    delete(keys: string[]): Promise<void>;

    touch(keys: IAdapterTouchOptions[]): Promise<void>;

    clear(namespace: string): Promise<void>;
}
