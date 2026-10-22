import * as fs from "fs";
import { SvgWriter } from "../io/SvgWriter";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class SaveCommand implements ICommand {
  readonly name = "save";
  readonly isEdit = false;
  readonly clearsHistory = true;

  constructor(
    private readonly ctx: EditorContext,
    private readonly file?: string
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const path = this.file ?? doc.getFilePath();
    if (!path) {
      throw new Error("cannot write file: (no path)");
    }
    try {
      const xml = new SvgWriter().write(doc);
      fs.writeFileSync(path, xml, "utf8");
      doc.setFilePath(path);
      this.ctx.history.lockAfterIo();
      return `saved to ${path} (${doc.countElements()} elements)`;
    } catch {
      throw new Error(`cannot write file: ${path}`);
    }
  }

  undo(): string {
    throw new Error("undo not allowed after io command");
  }
}
