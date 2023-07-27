<p align="center">
<a href="https://www.npmjs.com/package/@cacher/redis"><img src="https://img.shields.io/npm/v/@cacher/redis.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@cacher/redis"><img src="https://img.shields.io/npm/dt/@cacher/redis.svg?style=flat-square" alt="NPM downloads"></a>
</p>

Implementation of the redis adapter

# Installation
> **[Node.js](https://nodejs.org/) 14.0.0 or newer is required**  

### Yarn
```
yarn add @cacher/redis
```

### NPM
```
npm i @cacher/redis
```

## Example usage

```ts
import { Cacher } from '@cacher/cacher';
import { RedisAdapter } from '@cacher/redis';

const adapter = new RedisAdapter();

// const adapter = new RedisAdapter({
//     connection: ioredisClient    
// });

// const adapter = new RedisAdapter({
//     connection: 'redis://:authpassword@127.0.0.1:6380/4'
// });

// const adapter = new RedisAdapter({
//     connection: {
//         hostname: 'localhost',
//         port: 6379,

//         username: '...',
//         password: '...',

//         database: 1
//     }
// });

const cacher = new Cacher({
    adapter,

    namespace: 'users'
});
```
