import { IAdapter, MemoryAdapter } from './adapters';
import {
	ICacherOptions,
	ICacherGetOptions,
	ICacherSetOptions,
	ICacherIncrementOptions,
	ICacherTouchOptions,

	Serializer,
	Deserializer,

	AllowArray
} from './types';
import { arraify } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Cacher<V = any> {
	protected adapter: IAdapter;

	protected namespace: string;

	protected serializer: Serializer<V>;

	protected deserializer: Deserializer<V>;

	public constructor({
		adapter = new MemoryAdapter(),

		namespace,

		serializer = JSON.stringify,
		deserializer = JSON.parse
	}: ICacherOptions<V>) {
		this.adapter = adapter;

		this.namespace = namespace;

		this.serializer = serializer;
		this.deserializer = deserializer;
	}

	public async get<K extends string = string, A extends string = string>(
		rawKeys: AllowArray<ICacherGetOptions<K, A>>
	): Promise<Record<K, V | undefined> & Record<A, V | undefined>> {
		const keys = arraify(rawKeys);

		const rawValues = await this.adapter.get(
			keys.map(item => this.getNamespaceKey(item.key))
		);

		return Object.fromEntries(
			rawValues.map((rawValue, i) => {
				const key = keys[i].alias || keys[i].key;

				const value = rawValue !== undefined
					? this.deserializer(rawValue)
					: undefined;

				return [key, value];
			})
		) as unknown as Record<K, V | undefined> & Record<A, V | undefined>;
	}

	public set(
		rawKeys: AllowArray<ICacherSetOptions<V>>
	): Promise<void> {
		const keys = arraify(rawKeys);

		return this.adapter.set(keys.map(item => ({
			key: this.getNamespaceKey(item.key),
			value: this.serializer(item.value),
			ttl: item.ttl
		})));
	}

	public increment(rawKeys: AllowArray<ICacherIncrementOptions>): Promise<(number | undefined)[]> {
		const keys = arraify(rawKeys);

		return this.adapter.increment(keys.map(item => ({
			key: this.getNamespaceKey(item.key),
			value: item.value
		})));
	}

	public async delete(rawKeys: AllowArray<string>): Promise<void> {
		const keys = arraify(rawKeys);

		return this.adapter.delete(keys.map(key => (
			this.getNamespaceKey(key)
		)));
	}

	public async touch(rawKeys: AllowArray<ICacherTouchOptions>): Promise<void> {
		const keys = arraify(rawKeys);

		return this.adapter.touch(keys.map(item => ({
			key: this.getNamespaceKey(item.key),
			ttl: item.ttl
		})));
	}

	public clear(): Promise<void> {
		return this.adapter.clear(this.namespace);
	}

	protected getNamespaceKey(key: string): string {
		return `${this.namespace}:${key}`;
	}
}
