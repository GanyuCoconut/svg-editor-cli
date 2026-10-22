import * as readline from "readline";
import { CommandRegistry } from "../commands/CommandRegistry";
import { EditorContext } from "../commands/EditorContext";

function main(): void {
  const ctx = new EditorContext();
  const registry = new CommandRegistry(ctx);

  console.log("svg-editor 0.1 — type 'help' for commands");
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "svg> ",
  });

  rl.prompt();
  rl.on("line", (line) => {
    try {
      const out = registry.dispatch(line);
      if (out) console.log(out);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("error:")) {
        console.log(msg);
      } else {
        console.log(`error: ${msg}`);
      }
    }
    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}

main();
