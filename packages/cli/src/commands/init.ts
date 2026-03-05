import path from "path"
import fs from "fs-extra"
import { confirm } from "@inquirer/prompts"
import chalk from "chalk"
import ora from "ora"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// // __dirname = dist/commands/ at runtime
// // templates were copied to dist/templates/ by tsup onSuccess
// const PACKAGE_DIST_DIR = path.resolve(__dirname, "..")

export interface InitOptions {
  dir: string
  skipConfirmation?: boolean
}

interface FileMapping {
  /** Absolute source path inside dist/templates/ */
  src: string
  /** Absolute destination path in the developer's project */
  dest: string
  /** Human-readable description for the preview table */
  description: string
}

type PackageManager = "pnpm" | "yarn" | "bun" | "npm"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectPackageManager(projectDir: string): PackageManager {
  if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) return "pnpm"
  if (fs.existsSync(path.join(projectDir, "bun.lockb"))) return "bun"
  if (fs.existsSync(path.join(projectDir, "yarn.lock"))) return "yarn"
  return "npm"
}

function installCommand(pm: PackageManager, packages: string[], dev = false): string {
  const devFlag = dev ? (pm === "npm" ? " --save-dev" : " -D") : ""
  const pkgs = packages.join(" ")
  switch (pm) {
    case "pnpm": return `pnpm add${devFlag} ${pkgs}`
    case "yarn": return `yarn add${devFlag} ${pkgs}`
    case "bun":  return `bun add${devFlag} ${pkgs}`
    default:     return `npm install${devFlag} ${pkgs}`
  }
}

function runCommand(pm: PackageManager, script: string): string {
  if (pm === "npm") return `npm run ${script}`
  return `${pm} ${script}`
}

function relPath(from: string, to: string): string {
  return path.relative(from, to)
}

/** Detect whether the project already has a src/ directory */
function hasSrcDir(projectDir: string): boolean {
  return fs.existsSync(path.join(projectDir, "src"))
}

/** Detect whether the project already has a supabase/ directory */
function hasSupabaseDir(projectDir: string): boolean {
  return fs.existsSync(path.join(projectDir, "supabase"))
}

function printHeader(): void {
  console.log()
  console.log(chalk.bold.white("  supacommerce") + chalk.dim(" — ecommerce for Supabase"))
  console.log()
}

function printTable(mappings: FileMapping[], projectDir: string): void {
  const rows = mappings.map((m) => {
    const exists = fs.existsSync(m.dest)
    const status = exists
      ? chalk.yellow("overwrite")
      : chalk.green("create  ")
    const dest = chalk.cyan(relPath(projectDir, m.dest))
    return `  ${status}  ${dest}`
  })

  console.log(chalk.bold("  Files to be written:"))
  console.log()
  rows.forEach((r) => console.log(r))
  console.log()
}

// ─── Main command ─────────────────────────────────────────────────────────────

export async function initCommand(options: InitOptions): Promise<void> {
  printHeader()

  // ── 1. Resolve project directory ──────────────────────────────────────────
  const projectDir = path.resolve(options.dir)

  if (!fs.existsSync(projectDir)) {
    console.log(chalk.dim(`  Directory ${chalk.white(projectDir)} does not exist.`))
    const shouldCreate = await confirm({
      message: `Create it?`,
      default: true,
    })
    if (!shouldCreate) {
      console.log(chalk.dim("  Aborted."))
      process.exit(0)
    }
    await fs.ensureDir(projectDir)
    console.log(chalk.green(`  ✓ Created ${projectDir}`))
    console.log()
  }

  // ── 2. Resolve templates directory ────────────────────────────────────────
// init.ts compiles to dist/commands/init.js → __dirname = dist/commands/
  // Templates were copied by tsup.config.ts onSuccess to dist/templates/
  const TEMPLATES_DIR = path.join(__dirname, "templates")

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(chalk.red("  Error: templates directory not found at " + TEMPLATES_DIR))
    console.error(chalk.dim("  This is a build issue. Please report it at https://github.com/SiphoChris/supacommerce.git"))
    process.exit(1)
  }

  // ── 3. Determine target directories ───────────────────────────────────────
  // If src/ already exists → place schemas inside src/ecommerce/schema/
  // If no src/  → place at src/ecommerce/schema/ regardless (creates it)
  const schemaDestDir = path.join(projectDir, "src", "ecommerce", "schema")

  // Supabase functions: always inside supabase/functions/
  const functionsDestDir = path.join(projectDir, "supabase", "functions")

  // ── 4. Build file mappings ─────────────────────────────────────────────────
  const schemaFiles = [
    "currencies",
    "regions",
    "customers",
    "catalog",
    "inventory",
    "pricing",
    "promotions",
    "tax",
    "fulfillment",
    "cart",
    "orders",
    "payments",
    "sales_channels",
    "admin_users",
  ]

  const edgeFunctions = [
    "cart-checkout",
    "order-confirmed",
    "payment-webhook",
    "inventory-reserve",
  ]

  const mappings: FileMapping[] = [
    // Schema files
    ...schemaFiles.map((name) => ({
      src: path.join(TEMPLATES_DIR, "schema", `${name}.ts`),
      dest: path.join(schemaDestDir, `${name}.ts`),
      description: `Drizzle schema — ${name}`,
    })),

    // Edge functions
    ...edgeFunctions.map((fn) => ({
      src: path.join(TEMPLATES_DIR, "functions", fn, "index.ts"),
      dest: path.join(functionsDestDir, fn, "index.ts"),
      description: `Edge function — ${fn}`,
    })),

    // Shared edge function utilities
    {
      src: path.join(TEMPLATES_DIR, "functions", "_shared", "cors.ts"),
      dest: path.join(functionsDestDir, "_shared", "cors.ts"),
      description: "Edge function shared — cors helpers",
    },
    {
      src: path.join(TEMPLATES_DIR, "functions", "_shared", "supabaseAdmin.ts"),
      dest: path.join(functionsDestDir, "_shared", "supabaseAdmin.ts"),
      description: "Edge function shared — supabaseAdmin client",
    },

    // Import map for edge functions
    {
      src: path.join(TEMPLATES_DIR, "functions", "import_map.json"),
      dest: path.join(functionsDestDir, "import_map.json"),
      description: "Edge function import map",
    },

    // SQL files
    {
      src: path.join(TEMPLATES_DIR, "rls.sql"),
      dest: path.join(projectDir, "supabase", "rls.sql"),
      description: "Row Level Security policies",
    },
    {
      src: path.join(TEMPLATES_DIR, "functions.sql"),
      dest: path.join(projectDir, "supabase", "functions.sql"),
      description: "Postgres RPC functions (transactional operations)",
    },
    {
      src: path.join(TEMPLATES_DIR, "nuke-dbs.sql"),
      dest: path.join(projectDir, "supabase", "nuke-dbs.sql"),
      description: "SQL script to nuke databases",
    },
    {
      src: path.join(TEMPLATES_DIR, "nuke-policies.sql"),
      dest: path.join(projectDir, "supabase", "nuke-policies.sql"),
      description: "SQL script to nuke RLS policies",
    },

    // Drizzle config example
    {
      src: path.join(TEMPLATES_DIR, "drizzle.config.example.ts"),
      dest: path.join(projectDir, "drizzle.config.example.ts"),
      description: "Drizzle config example (rename to drizzle.config.ts)",
    },
  ]

  // ── 5. Validate all source files exist ────────────────────────────────────
  const missing = mappings.filter((m) => !fs.existsSync(m.src))
  if (missing.length > 0) {
    console.error(chalk.red("  Error: the following template files are missing:"))
    missing.forEach((m) => console.error(chalk.dim(`    ${m.src}`)))
    process.exit(1)
  }

  // ── 6. Warn about any existing files that will be overwritten ─────────────
  const willOverwrite = mappings.filter((m) => fs.existsSync(m.dest))

  if (willOverwrite.length > 0 && !options.skipConfirmation) {
    console.log(
      chalk.yellow(`  ⚠  ${willOverwrite.length} file(s) already exist and will be overwritten.`)
    )
    console.log()
  }

  // ── 7. Print preview table ─────────────────────────────────────────────────
  printTable(mappings, projectDir)

  // ── 8. Confirm ────────────────────────────────────────────────────────────
  if (!options.skipConfirmation) {
    const proceed = await confirm({
      message: "Proceed with these changes?",
      default: true,
    })

    if (!proceed) {
      console.log(chalk.dim("\n  Aborted. No files were written."))
      process.exit(0)
    }
    console.log()
  }

  // ── 9. Copy files ─────────────────────────────────────────────────────────
  const spinner = ora({ text: "Writing files…", color: "cyan" }).start()

  const results: Array<{ mapping: FileMapping; ok: boolean; error?: string }> = []

  for (const mapping of mappings) {
    try {
      await fs.ensureDir(path.dirname(mapping.dest))
      await fs.copy(mapping.src, mapping.dest, { overwrite: true })
      results.push({ mapping, ok: true })
    } catch (err) {
      results.push({
        mapping,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  spinner.stop()

  // ── 10. Print results ─────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok)
  const succeeded = results.filter((r) => r.ok)

  succeeded.forEach((r) => {
    const existed = willOverwrite.some((m) => m.dest === r.mapping.dest)
    const label = existed ? chalk.yellow("updated") : chalk.green("created")
    console.log(`  ${label}  ${chalk.cyan(relPath(projectDir, r.mapping.dest))}`)
  })

  if (failed.length > 0) {
    console.log()
    console.log(chalk.red(`  ${failed.length} file(s) failed to write:`))
    failed.forEach((r) => {
      console.log(
        chalk.red(`  ✗ ${relPath(projectDir, r.mapping.dest)}: ${r.error}`)
      )
    })
    console.log()
    process.exit(1)
  }

  // ── 11. Detect package manager and print next steps ───────────────────────
  const pm = detectPackageManager(projectDir)

  const deps = [
    "drizzle-orm",
    "@supabase/supabase-js",
    "@supacommerce/core",
  ]

  const devDeps = [
    "drizzle-kit",
  ]

  console.log()
  console.log(chalk.bold("  ✓ supacommerce initialised successfully!"))
  console.log()
  console.log(chalk.bold("  Next steps:"))
  console.log()

  console.log(chalk.dim("  1. Install dependencies"))
  console.log(`     ${chalk.white(installCommand(pm, deps))}`)
  console.log(`     ${chalk.white(installCommand(pm, devDeps, true))}`)
  console.log()

  console.log(chalk.dim("  2. Configure Drizzle"))
  console.log(`     ${chalk.white("mv drizzle.config.example.ts drizzle.config.ts")}`)
  console.log(`     ${chalk.dim("   Add your DATABASE_URL to .env")}`)
  console.log(`     ${chalk.dim("   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres")}`)
  console.log()

  console.log(chalk.dim("  3. Start Supabase locally"))
  console.log(`     ${chalk.white("supabase start")}`)
  console.log()

  console.log(chalk.dim("  4. Generate and apply migrations"))
  console.log(`     ${chalk.white(runCommand(pm, "db:generate"))}`)
  console.log(`     ${chalk.white(runCommand(pm, "db:push:remote"))} ${chalk.dim("(or: supabase db push)")}`)
  console.log()

  console.log(chalk.dim("  5. Apply RLS policies and Postgres functions"))
  console.log(`     ${chalk.dim("   Paste supabase/rls.sql into your Supabase SQL Editor")}`)
  console.log(`     ${chalk.dim("   Paste supabase/functions.sql into your Supabase SQL Editor")}`)
  console.log()

  console.log(chalk.dim("  6. Use the query client"))
  console.log(chalk.dim("     import { createClient as createSupabaseClient } from \"@supabase/supabase-js\""))
  console.log(chalk.dim("     import { createClient } from \"@supacommerce/core\""))
  console.log()
  console.log(chalk.dim("     const supabase = createSupabaseClient(url, anonKey)"))
  console.log(chalk.dim("     const commerce = createClient(supabase)"))
  console.log()
  console.log(chalk.dim("     const products = await commerce.catalog.listProducts()"))
  console.log(chalk.dim("     const cart = await commerce.cart.getOrCreate()"))
  console.log()

  console.log(
    chalk.dim("  Read the full docs at ") +
    chalk.white("https://github.com/supacommerce/supacommerce")
  )
  console.log()
}
