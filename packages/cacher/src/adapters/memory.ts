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

	public async get(keys: string[]): Promise<(string | undefined)[]> {
		return keys.map(key => (
			this.storage.get(key) || undefined
		));
	}

	public async set(keys: IAdapterSetOptions[]): Promise<void> {
		for (const { key, value } of keys) {
			this.storage.set(key, value);
		}
	}

	public async increment(keys: IAdapterIncrementOptions[]): Promise<(number | undefined)[]> {
		return keys.map(({ key, value }) => {
			const nextValue = Number(this.storage.get(key) || 0) + value;

			this.storage.set(key, String(nextValue));

			return nextValue;
		});
	}

	public async delete(keys: string[]): Promise<void> {
		for (const key of keys) {
			this.storage.delete(key);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
	public async touch(): Promise<void> {}

	public async clear(namespace: string): Promise<void> {
		for (const key of this.storage.keys()) {
			if (key.startsWith(namespace)) {
				this.storage.delete(key);
			}
		}
	}
}
