<p align="center">
<a href="https://www.npmjs.com/package/@cacher/cacher"><img src="https://img.shields.io/npm/v/@cacher/cacher.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@cacher/cacher"><img src="https://img.shields.io/npm/dt/@cacher/cacher.svg?style=flat-square" alt="NPM downloads"></a>
</p>

Modern implementation of key-value storage

# Installation
> **[Node.js](https://nodejs.org/) 14.0.0 or newer is required**  

### Yarn
```
yarn add @cacher/cacher
```

### NPM
```
npm i @cacher/cacher
```

## Example usage

```ts
import { Cacher } from '@cacher/cacher';

interface IMyData {
    someData: boolean;
}

const cacher = new Cacher<IMyData>({
    namespace: 'users'
});


async function run() {
    // Single
    
    const { 1: user } = await cacher.get({
        key: '1',
        // alias: 'user'
    });
    
    // With alias
    
    const { user } = await cacher.get({
        key: '1',
        alias: 'user'
    });

    // Multi get

    const result = await cacher.get([
        { key: '1' },
        { key: '2' },
        { key: '3' },
        { key: '4' }
    ]);

    // result[id] // => IMyData | undefined

    // Set

    await cacher.set({
        key: '1',
        value: {
            someData: true
        },
        // ms
        // ttl: 10_000
    });

    // Multi set

    await cacher.set([
        {
            key: '1',
            value: {
                someData: true
            },
            // ms
            // ttl: 10_000
        },
        {
            key: '2',
            value: {
                someData: true
            },
            // ms
            // ttl: 10_000
        }
    ]);

    // Increment
    // /!\ Cacher data must be float

    await cacher.increment({
        key: '1',
        value: 5
    });

    // Multi set

    await cacher.increment([
        {
            key: '1',
            value: 2
        },
        {
            key: '2',
            value: 4
        }
    ]);

    // Delete

    await cacher.delete('1');

    // Multi delete

    await cacher.delete(['1', '2', '3']);

    // Update ttl

    await cacher.touch({
        key: '1',
        ttl: 60_000
    });

    // Multi update ttl

    await cacher.touch([
        {
            key: '1',
            ttl: 60_000
        },
        {
            key: '2',
            ttl: 60_000
        }
    ]);

    // Clear all namespace

    await cacher.clear();
}

run().catch(console.log);
```

## Use adapter

```ts
import { Cacher } from '@cacher/cacher';
import { RedisAdapter } from '@cacher/redis';

const adapter = new RedisAdapter();

const cacher = new Cacher({
    adapter,

    namespace: 'users'
});
```
