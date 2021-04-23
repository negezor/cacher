import {
	IAdapter, IAdapterIncrementOptions, IAdapterSetOptions, IAdapterTouchOptions
} from './adapter';

export interface IUnionAdapterOptions {
	adapters: [IAdapter, IAdapter];

	replicaTtl?: number;
	replicaMode?: boolean;
}

export class UnionAdapter implements IAdapter {
	protected readonly adapters: IUnionAdapterOptions['adapters'];

	protected readonly replicaTtl?: number;

	protected readonly replicaMode: boolean;

	public constructor({
		adapters,

		replicaTtl,
		replicaMode = true
	}: IUnionAdapterOptions) {
		this.adapters = adapters;

		this.replicaTtl = replicaTtl;
		this.replicaMode = replicaMode;
	}

	public async get(keys: string[]): Promise<(string | undefined)[]> {
		const [firstAdapter, secondAdapter] = this.adapters;

		const firstItems = await firstAdapter.get(keys);

		const keysForSecond = keys.filter((item, index) => (
			firstItems[index] === undefined
		)) as string[];

		if (keysForSecond.length === 0) {
			return firstItems;
		}

		const secondResult = await secondAdapter.get(keysForSecond);

		if (this.replicaMode) {
			const list: IAdapterSetOptions[] = [];

			keysForSecond.forEach((key, index) => {
				const value = secondResult[index];

				if (value === undefined) {
					return;
				}

				list.push({
					key,
					value,

					ttl: this.replicaTtl
				});
			});

			if (list.length !== 0) {
				await firstAdapter.set(list);
			}
		}

		let index = -1;

		// eslint-disable-next-line no-return-assign
		return firstItems.map(item => (
			item !== undefined
				? item
				: secondResult[index += 1]
		));
	}

	public async set(keys: IAdapterSetOptions[]): Promise<void> {
		await Promise.all(this.adapters.map(adapter => (
			adapter.set(keys)
		)));
	}

	public async increment(keys: IAdapterIncrementOptions[]): Promise<(number | undefined)[]> {
		const [firstAdapter, secondAdapter] = this.adapters;

		const [firstKeys, secondKeys] = await Promise.all([
			firstAdapter.increment(keys),
			secondAdapter.increment(keys)
		]);

		return keys.map((_, index) => firstKeys[index] || secondKeys[index]);
	}

	public async delete(keys: string[]): Promise<void> {
		await Promise.all(this.adapters.map(adapter => (
			adapter.delete(keys)
		)));
	}

	public async touch(keys: IAdapterTouchOptions[]): Promise<void> {
		await Promise.all(this.adapters.map(adapter => (
			adapter.touch(keys)
		)));
	}

	public async clear(namespace: string): Promise<void> {
		await Promise.all(this.adapters.map(adapter => (
			adapter.clear(namespace)
		)));
	}
}
