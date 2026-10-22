import { AddToCommand } from "./AddToCommand";
import { CanvasCommand } from "./CanvasCommand";
import { CreateCommand } from "./CreateCommand";
import { DeleteCommand } from "./DeleteCommand";
import { EditorContext } from "./EditorContext";
import { GroupCommand } from "./GroupCommand";
import { ICommand } from "./ICommand";
import { InitCommand } from "./InitCommand";
import { MoveCommand } from "./MoveCommand";
import { ReadCommand } from "./ReadCommand";
import { SaveCommand } from "./SaveCommand";
import { ScaleCommand } from "./ScaleCommand";
import { SetCommand } from "./SetCommand";
import { UngroupCommand } from "./UngroupCommand";
import { ZOrderCommand } from "./ZOrderCommand";
import { extractInClause, tokenize } from "../cli/LineParser";
import { HelpPrinter } from "../view/HelpPrinter";
import { ShowPrinter } from "../view/ShowPrinter";
import { TreePrinter } from "../view/TreePrinter";

/**
 * Command name → implementation dispatch (one of two allowed name switches).
 * Marked for future plugin refactor in architecture doc.
 */
export class CommandRegistry {
  constructor(private readonly ctx: EditorContext) {}

  /** Parse a line and run it. Returns output string (may be multi-line). */
  dispatch(line: string): string {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return "";
    }
    const tokens = tokenize(trimmed);
    const cmd = tokens[0];

    if (cmd === "undo") {
      return this.ctx.history.undo();
    }
    if (cmd === "redo") {
      return this.ctx.history.redo();
    }
    if (cmd === "help") {
      return new HelpPrinter().print();
    }
    if (cmd === "tree") {
      const doc = this.ctx.requireDocument();
      return new TreePrinter().print(doc, tokens[1]);
    }
    if (cmd === "show") {
      if (!tokens[1]) throw new Error("usage: show <id>");
      const doc = this.ctx.requireDocument();
      return new ShowPrinter().print(doc, tokens[1]);
    }

    const command = this.build(cmd, tokens.slice(1));
    const msg = command.execute();
    if (command.clearsHistory) {
      this.ctx.history.lockAfterIo();
    } else if (command.isEdit) {
      this.ctx.history.pushExecuted(command);
    }
    return msg;
  }

  private build(name: string, args: string[]): ICommand {
    switch (name) {
      case "init": {
        const w = args[0] !== undefined ? Number(args[0]) : 800;
        const h = args[1] !== undefined ? Number(args[1]) : 600;
        return new InitCommand(this.ctx, w, h);
      }
      case "read": {
        if (!args[0]) throw new Error("usage: read <file.svg>");
        return new ReadCommand(this.ctx, args[0]);
      }
      case "save":
        return new SaveCommand(this.ctx, args[0]);
      case "canvas": {
        if (args.length === 0) return new CanvasCommand(this.ctx);
        return new CanvasCommand(this.ctx, Number(args[0]), Number(args[1]));
      }
      case "create":
        return this.buildCreate(args);
      case "delete": {
        if (!args[0]) throw new Error("usage: delete <id>");
        return new DeleteCommand(this.ctx, args[0]);
      }
      case "move": {
        if (args.length < 3) throw new Error("usage: move <id> <dx> <dy>");
        return new MoveCommand(
          this.ctx,
          args[0],
          Number(args[1]),
          Number(args[2])
        );
      }
      case "scale": {
        if (args.length < 2) throw new Error("usage: scale <id> <factor>");
        return new ScaleCommand(this.ctx, args[0], Number(args[1]));
      }
      case "set": {
        if (args.length < 3) throw new Error("usage: set <id> <attr> <value>");
        return new SetCommand(this.ctx, args[0], args[1], args.slice(2).join(" "));
      }
      case "group": {
        if (args.length < 2) throw new Error("usage: group <newGid> <id1>…");
        return new GroupCommand(this.ctx, args[0], args.slice(1));
      }
      case "ungroup": {
        if (!args[0]) throw new Error("usage: ungroup <gid>");
        return new UngroupCommand(this.ctx, args[0]);
      }
      case "addto": {
        if (args.length < 2) throw new Error("usage: addto <gid> <id>");
        return new AddToCommand(this.ctx, args[0], args[1]);
      }
      case "front": {
        if (!args[0]) throw new Error("usage: front <id>");
        return new ZOrderCommand(this.ctx, args[0], true);
      }
      case "back": {
        if (!args[0]) throw new Error("usage: back <id>");
        return new ZOrderCommand(this.ctx, args[0], false);
      }
      default:
        throw new Error(`unknown command: ${name}`);
    }
  }

  private buildCreate(args: string[]): CreateCommand {
    const { args: body, containerId } = extractInClause(args);
    if (body.length < 2) {
      throw new Error("usage: create <type> <id> [params…] [in <containerId>]");
    }
    const type = body[0];
    const id = body[1];
    const rest = body.slice(2);

    if (type === "g") {
      return new CreateCommand(this.ctx, type, id, [], undefined, undefined, containerId);
    }
    if (type === "text") {
      // create text <id> <x> <y> "content"
      if (rest.length < 3) throw new Error("usage: create text <id> <x> <y> \"content\"");
      return new CreateCommand(
        this.ctx,
        type,
        id,
        [Number(rest[0]), Number(rest[1])],
        undefined,
        rest[2],
        containerId
      );
    }

    const nums: number[] = [];
    let color: string | undefined;
    for (const t of rest) {
      if (t !== "" && !Number.isNaN(Number(t)) && /^-?\d+(\.\d+)?$/.test(t)) {
        nums.push(Number(t));
      } else {
        color = t;
      }
    }
    return new CreateCommand(this.ctx, type, id, nums, color, undefined, containerId);
  }
}
