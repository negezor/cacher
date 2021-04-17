export interface IAdapterSetOptions {
	key: string;
	value: string;
	ttl?: number;
}

export interface IAdapterTouchOptions {
	key: string;
	ttl: number;
}

export interface IAdapter {
	get(keys: string[]): Promise<(string | undefined)[]>;

	set(keys: IAdapterSetOptions[]): Promise<void>;

	increment(keys: string[], value: number): Promise<number[]>

	decrement(keys: string[], value: number): Promise<number[]>

	delete(keys: string[]): Promise<void>;

	touch(keys: IAdapterTouchOptions[]): Promise<void>;

	clear(namespace: string): Promise<void>;
}
