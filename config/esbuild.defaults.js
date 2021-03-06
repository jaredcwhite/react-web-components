// This file is created and managed by Bridgetown.
// Instead of editing this file, add your overrides to `esbuild.config.js`
//
// To update this file to the latest version provided by Bridgetown,
// run `bridgetown esbuild update`. Any changes to this file will be overwritten
// when an update is applied hence we strongly recommend adding overrides to
// `esbuild.config.js` instead of editing this file.
//
// Shipped with Bridgetown v1.0.0.alpha11

const path = require("path")
const fsLib = require("fs")
const fs = fsLib.promises
const postcss = require("postcss")
const postCssImport = require("postcss-import")
const readCache = require("read-cache")

const postCssPlugin = (options) => ({
  name: "postcss",
  async setup(build) {
    // Process .css files with PostCSS
    build.onLoad({ filter: /\.(css)$/ }, async (args) => {
      const additionalFilePaths = []
      const css = await fs.readFile(args.path, "utf8")

      // Configure import plugin so PostCSS can properly resolve `@import`ed CSS files
      const importPlugin = postCssImport({
        filter: itemPath => {
          // We'll want to track any imports later when in watch mode
          additionalFilePaths.push(path.resolve(path.dirname(args.path), itemPath))
          return true
        },
        load: async filename => {
          let contents = await readCache(filename, "utf-8")
          const filedir = path.dirname(filename)

          // We need to transform `url(...)` in imported CSS so the filepaths are properly
          // relative to the entrypoint. Seems icky to have to hack this! C'est la vie...
          contents = contents.replace(/url\(['"]?\.\/(.*?)['"]?\)/g, (_match, p1) => {
            const relpath = path.relative(args.path, path.resolve(filedir, p1)).replace(/^\.\.\//, "")
            return `url("${relpath}")`
          })
          return contents
        }
      })

      // Process the file through PostCSS
      const result = await postcss([importPlugin, ...options.plugins]).process(css, {
        map: true,
        ...options.options,
        from: args.path,
      });

      return {
        contents: result.css,
        loader: "css",
        watchFiles: [args.path, ...additionalFilePaths],
      }
    })
  },
})

// Set up some nice default for Bridgetown
const bridgetownPreset = (outputFolder) => ({
  name: "bridgetownPreset",
  async setup(build) {
    // Ensure any imports anywhere starting with `/` are left verbatim
    // so they can be used in-browser for actual `src` repo files
    build.onResolve({ filter: /^\// }, args => {
      return { path: args.path, external: true }
    })

    // Ensure any barebones CSS imports like `index.css` get resolved to within the styles folder
    build.onResolve({ filter: /^[^./@].*?\.css$/ }, args => {
      return { path: path.join(args.resolveDir, "../styles", args.path) }
    })

    build.onStart(() => {
      console.log("esbuild: frontend bundling started...")
    })

    // Generate the final output manifest
    build.onEnd(async (result) => {
      if (!result.metafile) {
        console.warn("esbuild: build process error, cannot write manifest")
        return
      }

      const manifest = {}
      const entrypoints = []

      // We don't need `frontend/` cluttering up everything
      const stripPrefix = (str) => str.replace(/^frontend\//, "")

      // For calculating the file size of bundle output
      const fileSize = (path) => {
        const { size } = fsLib.statSync(path)
        const i = Math.floor(Math.log(size) / Math.log(1024))
        return (size / Math.pow(1024, i)).toFixed(2) * 1 + ['B', 'KB', 'MB', 'GB', 'TB'][i]
      }

      // Let's loop through all the various outputs
      for (const key in result.metafile.outputs) {
        const value = result.metafile.outputs[key]
        const inputs = Object.keys(value.inputs)
        const pathShortener = new RegExp(`^${outputFolder}\\/_bridgetown\\/static\\/`, "g")
        const outputPath = key.replace(pathShortener, "")

        if (value.entryPoint) {
          // We have an entrypoint!
          manifest[stripPrefix(value.entryPoint)] = outputPath
          entrypoints.push([outputPath, fileSize(key)])
        } else if (key.match(/index\.[^-.]*\.css/) && inputs.find(item => item.endsWith("index.css"))) {
          // Special treatment for index.css
          manifest[stripPrefix(inputs.find(item => item.endsWith("index.css")))] = outputPath
          entrypoints.push([outputPath, fileSize(key)])
        } else if (inputs.length > 0) {
          // Naive implementation, we'll just grab the first input and hope it's accurate
          manifest[stripPrefix(inputs[0])] = outputPath
        }
      }

      const manifestFolder = path.join(process.cwd(), ".bridgetown-cache", "frontend-bundling")
      await fs.mkdir(manifestFolder, { recursive: true })
      await fs.writeFile(path.join(manifestFolder, "manifest.json"), JSON.stringify(manifest))

      console.log("esbuild: frontend bundling complete!")
      console.log("esbuild: entrypoints processed:")
      entrypoints.forEach(entrypoint => {
        const [entrypointName, entrypointSize] = entrypoint
        console.log(`         - ${entrypointName}: ${entrypointSize}`)
      })
    })
  }
})

// Load the PostCSS config from postcss.config.js or whatever else is a supported location/format
const postcssrc = require("postcss-load-config")
const postCssConfig = postcssrc.sync()

module.exports = (outputFolder, esbuildOptions) => {
  esbuildOptions.plugins = esbuildOptions.plugins || []
  // Add the PostCSS plugin to the top of the plugin stack
  esbuildOptions.plugins.unshift(postCssPlugin(postCssConfig))
  // Add the Bridgetown preset to the bottom of the plugin stack
  esbuildOptions.plugins.push(bridgetownPreset(outputFolder))

  // esbuild, take it away!
  require("esbuild").build({
    bundle: true,
    loader: {
      ".jpg": "file",
      ".png": "file",
      ".gif": "file",
      ".svg": "file",
      ".woff": "file",
      ".woff2": "file",
      ".ttf": "file",
      ".eot": "file",
    },
    watch: process.argv.includes("--watch"),
    minify: process.argv.includes("--minify"),
    sourcemap: true,
    entryPoints: ["frontend/javascript/index.js"],
    outdir: path.join(process.cwd(), `${outputFolder}/_bridgetown/static`),
    metafile: true,
    entryNames: "[dir]/[name].[hash]",
    ...esbuildOptions,
  }).catch(() => process.exit(1))
}
