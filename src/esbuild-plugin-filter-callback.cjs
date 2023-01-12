/*
 * ISC License
 *
 * Copyright (c) 2023 Alexis Royer (https://github.com/alxroyer)
 */


// Filter callback types.
/** @typedef {(args: import("esbuild").OnResolveArgs | import("esbuild").OnLoadArgs) => boolean} GeneralFilterCallback Returns `true` for paths that should actually be processed by the final `esbuild` plugin, `false` if not. */
/** @typedef {(args: import("esbuild").OnResolveArgs) => boolean} OnResolveFilterCallback Filter callback for `onResolve` only. */
/** @typedef {(args: import("esbuild").OnLoadArgs) => boolean} OnLoadFilterCallback Filter callback for `onLoad` only. */
/**
 * @typedef FilterCallbacks Collection of optional `onResolve` and `onLoad` filter callbacks.
 * @property {OnResolveFilterCallback | undefined} onResolve
 * @property {OnLoadFilterCallback | undefined} onLoad
 */

// Plugin option types.
/**
 * @typedef PluginOptions
 * @property {import("esbuild").Plugin} plugin Final `esbuild` plugin to filter paths for.
 * @property {GeneralFilterCallback | FilterCallbacks} filter Filter callback(s).
 */


/**
 * @param {PluginOptions} options See `PluginOptions` above.
 * @returns {import("esbuild").Plugin}
 */
module.exports = (options) => ({
    name: `filter-callback(${options.plugin.name})`,

    /**
     * @param {import("esbuild").PluginBuild} build Actual *build* object given by `esbuild`.
     * @returns {void | Promise<void>}
     */
    setup(build) {
        // Save input options.
        const {plugin, filter} = options;
        /** @const {FilterCallbacks} filterCallbacks */
        const filterCallbacks = {
            onResolve: (typeof(filter) === "function") ? filter : filter.onResolve,
            onLoad: (typeof(filter) === "function") ? filter : filter.onLoad,
        };

        // Shortcuts for `esbuild` return types below.
        /**
         * @typedef {(
         *     | import("esbuild").OnResolveResult | null | undefined
         *     | Promise<import("esbuild").OnResolveResult | null | undefined>
         * )} OnResolveCallbackResult
         * @typedef {(
         *     | import("esbuild").OnLoadResult | null | undefined
         *     | Promise<import("esbuild").OnLoadResult | null | undefined>
         * )} OnLoadCallbackResult
         */

        // Create an intermediate *build* object,
        // a wrapper that catches `onResolve()` and/or `onLoad()` calls,
        // in order to have our filter callbacks operate before the final `esbuild` plugin is called.
        /** @const {import("esbuild").PluginBuild} buildWrapper */
        const buildWrapper = {...build};
        if (filterCallbacks.onResolve) {
            /**
             * @param {import("esbuild").OnResolveOptions} options `onResolve()` options as passed on by the final `esbuild` plugin.
             * @param {(args: import("esbuild").OnResolveArgs) => OnResolveCallbackResult} callback `onResolve()` callback given by the final `esbuild` plugin.
             * @returns {void}
             */
            buildWrapper.onResolve = (options, callback) => {
                build.onResolve(
                    options,
                    /**
                     * @brief Apply our filter callback before calling the final `esbuild` plugin.
                     * @param {import("esbuild").OnResolveArgs} args
                     * @returns {OnResolveCallbackResult}
                     */
                    (args) => {
                        if (filterCallbacks.onResolve(args)) {
                            return callback(args);
                        }
                    },
                );
            };
        }
        if (filterCallbacks.onLoad) {
            /**
             * @param {import("esbuild").OnLoadOptions} options `onLoad()` options as passed on by the final `esbuild` plugin.
             * @param {(args: import("esbuild").OnLoadArgs) => OnLoadCallbackResult} callback `onLoad()` callback given by the final `esbuild` plugin.
             * @returns {void}
             */
            buildWrapper.onLoad = (options, callback) => {
                build.onLoad(
                    options,
                    /**
                     * @brief Apply our filter callback before calling the final `esbuild` plugin.
                     * @param {import("esbuild").OnLoadArgs} args
                     * @returns {OnLoadCallbackResult}
                     */
                    (args) => {
                        if (filterCallbacks.onLoad(args)) {
                            return callback(args);
                        }
                    },
                );
            };
        }

        // Propagate the `setup()` call onto the final `esbuild` plugin with our intermediate *build wrapper*.
        plugin.setup(buildWrapper);
    },
});
