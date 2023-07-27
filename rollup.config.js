import typescriptPlugin from 'rollup-plugin-typescript2';

import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
import { dirname, join as pathJoin } from 'node:path';

const MODULES = [
    'cacher',
    'redis',
];

const coreModules = builtinModules.filter(name => (
    !/(^_|\/)/.test(name)
));

const rootDir = dirname(fileURLToPath(import.meta.url));

const cacheRoot = pathJoin(tmpdir(), '.rpt2_cache');

/** @param {string} path */
const getModulePath = path => (
    pathJoin(rootDir, 'packages', path)
);

// eslint-disable-next-line import/no-default-export
export default async () => (
    Promise.all(
        MODULES
            .map(getModulePath)
            .map(async (modulePath) => {
                /**
                 * @type {{
                 *  dependencies?: Record<string, string>,
                 *  peerDependencies?: Record<string, string>,
                 * }}
                */
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const modulePkg = await import(
                    pathJoin(modulePath, 'package.json'),
                    {
                        assert: {
                            type: 'json',
                        },
                    }
                );

                const src = pathJoin(modulePath, 'src');
                const lib = pathJoin(modulePath, 'lib');

                return {
                    input: pathJoin(src, 'index.ts'),
                    plugins: [
                        typescriptPlugin({
                            cacheRoot,

                            useTsconfigDeclarationDir: false,

                            tsconfigOverride: {
                                outDir: lib,
                                rootDir: src,
                                include: [src],
                            },
                        }),
                    ],
                    external: [
                        ...Object.keys(modulePkg.dependencies || {}),
                        ...Object.keys(modulePkg.peerDependencies || {}),
                        // TODO: To make better
                        ...MODULES.map(moduleName => `@cacher/${moduleName}`),
                        ...coreModules,
                    ],
                    output: [
                        {
                            file: pathJoin(modulePath, 'lib/index.js'),
                            format: 'cjs',
                            exports: 'named',
                        },
                        {
                            file: pathJoin(modulePath, 'lib/index.mjs'),
                            format: 'esm',
                        },
                    ],
                };
            })
    )
);
