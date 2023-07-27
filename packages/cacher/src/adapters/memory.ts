import { IAdapter, IAdapterIncrementOptions, IAdapterSetOptions } from './adapter';

export interface IMapLike<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): this | undefined;
    delete(key: K): boolean;
    keys(): K[] | IterableIterator<K>;
}

export interface IMemoryAdapterOptions {
    storage?: IMapLike<string, string>;
}

export class MemoryAdapter implements IAdapter {
    protected readonly storage: IMapLike<string, string>;

    public constructor({ storage = new Map() }: IMemoryAdapterOptions = {}) {
        this.storage = storage;
    }

    public get(keys: string[]): Promise<(string | undefined)[]> {
        return Promise.resolve(keys.map(key => (
            this.storage.get(key) || undefined
        )));
    }

    public set(keys: IAdapterSetOptions[]): Promise<void> {
        for (const { key, value } of keys) {
            this.storage.set(key, value);
        }

        return Promise.resolve();
    }

    public increment(keys: IAdapterIncrementOptions[]): Promise<(number | undefined)[]> {
        return Promise.resolve(keys.map(({ key, value }) => {
            const nextValue = Number(this.storage.get(key) || 0) + value;

            this.storage.set(key, String(nextValue));

            return nextValue;
        }));
    }

    public delete(keys: string[]): Promise<void> {
        for (const key of keys) {
            this.storage.delete(key);
        }

        return Promise.resolve();
    }

    public async touch(): Promise<void> {
        return Promise.resolve();
    }

    public clear(namespace: string): Promise<void> {
        for (const key of this.storage.keys()) {
            if (key.startsWith(namespace)) {
                this.storage.delete(key);
            }
        }

        return Promise.resolve();
    }
}
