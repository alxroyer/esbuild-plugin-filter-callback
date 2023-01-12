# `esbuild-plugin-filter-callback`

## Purpose

This `esbuild` plugin may be used when one needs to use a third-party `esbuild` plugin,
but with a complex filter that can't easily be expressed with a Go-compatible regex.

[esbuild#1634](https://github.com/evanw/esbuild/issues/1634#issuecomment-927204088) suggests to return directly from the `esbuild` plugin,
but when using a third-party plugin, we don't want to modify it.

Related resources:
- Filtering-out regex, not Go-compatible: https://stackoverflow.com/questions/21962329/regex-that-matches-anything-not-ending-in-json#21962370
- Partial workaround for filtering-out *.json* files: https://github.com/nativew/esbuild-plugin-babel/issues/8#issuecomment-947638498


## Installation

```bash
npm install --save-dev esbuild-plugin-filter-callback
```
or
```bash
yarn add -D esbuild-plugin-filter-callback
```


## Usage

```js
// esbuild.config.js

import esbuildPluginFilterCallback from "esbuild-plugin-filter-callback";
import path from "path";

// Let:
// - `esbuildConfig` the `esbuild` configuration being set in 'esbuild.config.js'.
// - `finalEsbuildPlugin()` a final `esbuild` plugin builder function.

esbuildConfig.plugins.push(esbuildPluginFilterCallback({
    /**
     * @param {import("esbuild").OnResolveArgs | import("esbuild").OnLoadArgs} args Input information as given by `esbuild`.
     * @returns {boolean} `true` if the final `esbuild` plugin can be called, `false` if not.
     */
    filter: (args) => {
        // Example:

        // A common filtering-out callback returns `false` on rejection conditions...
        if (args.path.endsWith(".json")) return false;
        if (path.basename(args.path) === "jsbi.mjs") return false;

        // ...and `true` otherwise.
        return true;
    },

    plugin: finalEsbuildPlugin({
        // Final plugin configuration here,
        // setting `filter` being useless here.
    }),
}));
```

The `filter` parameter may also discriminate filter callbacks for `onResolve` and `onLoad` cases:
```js
    filter: {
        /**
         * @brief `onResolve()` filter callback.
         * @param {import("esbuild").OnResolveArgs} args
         * @returns {boolean}
         */
        onResolve: (args) => {
            // See example above.
            return true;
        },

        /**
         * @brief `onLoad()` filter callback.
         * @param {import("esbuild").OnLoadArgs} args
         * @returns {boolean}
         */
        onLoad: (args) => {
            // See example above.
            return true;
        },
    },
```
Either `onResolve` and/or `onLoad` filter callbacks may be defined, depending on the final `esbuild` plugin behaviour.


## Contribution

This project is hosted on [github](https://github.com/alxroyer/esbuild-plugin-filter-callback).

Feel free to [report issues](https://github.com/alxroyer/esbuild-plugin-filter-callback/issues)
or [contribute](https://github.com/alxroyer/esbuild-plugin-filter-callback/pulls).
