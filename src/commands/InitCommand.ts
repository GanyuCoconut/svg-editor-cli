import { Document } from "../model/Document";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class InitCommand implements ICommand {
  readonly name = "init";
  readonly isEdit = false;
  readonly clearsHistory = true;

  constructor(
    private readonly ctx: EditorContext,
    private readonly width: number,
    private readonly height: number
  ) {}

  execute(): string {
    this.ctx.document = new Document(this.width, this.height);
    this.ctx.history.lockAfterIo();
    return `canvas ${this.width}x${this.height} created`;
  }

  undo(): string {
    throw new Error("undo not allowed after io command");
  }
}
