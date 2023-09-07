import { runBuildCommand } from "./commands/build.ts";
import { runNewCommand } from "./commands/new.ts";
import { runServeCommand } from "./commands/serve.ts";
import { config } from "./config.ts";

if (import.meta.main) {
  const command = Deno.args[0] ?? "build";
  if (command === "build") {
    await runBuildCommand(config);
  } else if (command === "new") {
    runNewCommand(config);
  } else if (command === "serve") {
    runServeCommand(config);
  } else {
    console.error(`Unknown command: ${command}`);
  }
}
