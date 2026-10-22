import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class CanvasCommand implements ICommand {
  readonly name = "canvas";
  readonly isEdit = false;
  readonly clearsHistory: boolean;

  private oldW = 0;
  private oldH = 0;
  private resized = false;

  constructor(
    private readonly ctx: EditorContext,
    private readonly width?: number,
    private readonly height?: number
  ) {
    this.clearsHistory = width !== undefined && height !== undefined;
  }

  execute(): string {
    const doc = this.ctx.requireDocument();
    if (this.width === undefined || this.height === undefined) {
      return `canvas ${doc.getWidth()}x${doc.getHeight()}`;
    }
    this.oldW = doc.getWidth();
    this.oldH = doc.getHeight();
    doc.setSize(this.width, this.height);
    this.resized = true;
    this.ctx.history.lockAfterIo();
    return `canvas resized to ${this.width}x${this.height}`;
  }

  undo(): string {
    throw new Error("undo not allowed after io command");
  }
}
