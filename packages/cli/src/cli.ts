import { program } from "commander"
import { initCommand } from "./commands/init.js"

program
  .name("supacommerce")
  .description("Ecommerce building blocks for Supabase")
  .version("0.1.0")

program
  .command("init")
  .description("Initialise supacommerce in your project — copies schemas, edge functions, and SQL files")
  .option("-d, --dir <directory>", "Target project directory", ".")
  .option("--skip-confirmation", "Skip the confirmation prompt and copy files immediately")
  .action(async (options: { dir: string; skipConfirmation?: boolean }) => {
    await initCommand(options)
  })

program.parse()
