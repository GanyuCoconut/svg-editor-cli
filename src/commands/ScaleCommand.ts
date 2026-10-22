import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class ScaleCommand implements ICommand {
  readonly name = "scale";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private done = false;

  constructor(
    private readonly ctx: EditorContext,
    private readonly id: string,
    private readonly factor: number
  ) {}

  execute(): string {
    if (this.factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    shape.scaleBy(this.factor);
    this.done = true;
    return `${shape.typeName}#${shape.id} scaled by ${this.factor}`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape || !this.done) return "";
    shape.scaleBy(1 / this.factor);
    return `${shape.typeName}#${shape.id} scaled by ${1 / this.factor}`;
  }
}
