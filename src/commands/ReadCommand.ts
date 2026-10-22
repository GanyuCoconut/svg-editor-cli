import * as fs from "fs";
import { SvgReader } from "../io/SvgReader";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class ReadCommand implements ICommand {
  readonly name = "read";
  readonly isEdit = false;
  readonly clearsHistory = true;

  constructor(
    private readonly ctx: EditorContext,
    private readonly file: string
  ) {}

  execute(): string {
    let xml: string;
    try {
      xml = fs.readFileSync(this.file, "utf8");
    } catch {
      throw new Error(`cannot read file: ${this.file}`);
    }
    const result = new SvgReader().read(xml);
    result.document.setFilePath(this.file);
    this.ctx.document = result.document;
    this.ctx.history.lockAfterIo();
    const lines = result.warnings.slice();
    lines.push(
      `read ${this.file} (${result.document.countElements()} elements)`
    );
    return lines.join("\n");
  }

  undo(): string {
    throw new Error("undo not allowed after io command");
  }
}
