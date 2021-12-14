import IORedis from 'ioredis';

import {
	IAdapter,
	IAdapterIncrementOptions,
	IAdapterSetOptions,
	IAdapterTouchOptions
} from '@cacher/cacher';

export interface IRedisAdapterConnectionOptions {
	hostname?: string;
	port?: number;

	username?: string;
	password?: string;

	database?: number;
}

export interface IRedisAdapterOptions {
	connection?: IRedisAdapterConnectionOptions | IORedis.Redis | string;
}

export class RedisAdapter implements IAdapter {
	protected readonly redis: IORedis.Redis;

	public constructor({ connection = {} }: IRedisAdapterOptions = {}) {
		if (typeof connection === 'string') {
			this.redis = new IORedis(connection);
		} else if (connection instanceof IORedis) {
			this.redis = connection;
		} else {
			this.redis = new IORedis({
				host: connection.hostname,
				port: connection.port,
				username: connection.username,
				password: connection.password,
				db: connection.database
			});
		}
	}

	public async get(keys: string[]): Promise<(string | undefined)[]> {
		const values = await this.redis.mget(keys);

		return values.map(value => (
			value !== null
				? value
				: undefined
		));
	}

	public async set(keys: IAdapterSetOptions[]): Promise<void> {
		const mset: string[] = [];
		const ttlMset: [string, string, 'PX', number][] = [];

		for (const { key, value, ttl } of keys) {
			if (ttl === undefined) {
				mset.push(key, value);

				continue;
			}

			ttlMset.push([key, value, 'PX', ttl]);
		}

		const promises: Promise<unknown>[] = [];

		if (mset.length !== 0) {
			promises.push(
				this.redis.mset(...mset)
			);
		}

		if (ttlMset.length === 1) {
			promises.push(
				this.redis.set(...ttlMset[0])
			);
		} else if (ttlMset.length !== 0) {
			const pipeline = this.redis.multi();

			for (const payload of ttlMset) {
				pipeline.set(...payload);
			}

			promises.push(pipeline.exec());
		}

		await Promise.all(promises);
	}

	public async increment(keys: IAdapterIncrementOptions[]): Promise<(number | undefined)[]> {
		if (keys.length === 1) {
			const { key, value } = keys[0];

			const result = await this.redis.incrbyfloat(key, value);

			return [result];
		}

		const pipeline = this.redis.multi();

		const promise = Promise.all(keys.map(({ key, value }) => (
			this.redis.incrbyfloat(key, value)
		)));

		const { 1: result } = await Promise.all([
			pipeline.exec(),
			promise
		]);

		return result;
	}

	public async delete(keys: string[]): Promise<void> {
		await this.redis.del(...keys);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
	public async touch(keys: IAdapterTouchOptions[]): Promise<void> {
		if (keys.length === 1) {
			const { key, ttl } = keys[0];

			await this.redis.pexpire(key, ttl);

			return;
		}

		const pipeline = this.redis.multi();

		const promise = Promise.all(keys.map(({ key, ttl }) => (
			this.redis.pexpire(key, ttl)
		)));

		await Promise.all([
			pipeline.exec(),
			promise
		]);
	}

	public async clear(namespace: string): Promise<void> {
		const stream = this.redis.scanStream({
			match: `${namespace}:*`
		});

		for await (const keys of stream) {
			await this.redis.del(...keys);
		}
	}
}
