import { defineConfig } from "tsup"
import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  async onSuccess() {
    // Copy the templates directory verbatim into dist/
    // Templates are raw .ts files — they must NOT be compiled.
    // The CLI copies them directly into the developer's project.
    const src = path.join(__dirname, "src", "templates")
    const dest = path.join(__dirname, "dist", "templates")
    await fs.copy(src, dest, { overwrite: true })
    console.log("✓ Templates copied to dist/templates")
  },
})
