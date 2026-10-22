import { Group } from "../model/Group";
import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class DeleteCommand implements ICommand {
  readonly name = "delete";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private snapshot: Shape | null = null;
  private parent: Group | null = null;
  private index = -1;

  constructor(
    private readonly ctx: EditorContext,
    private readonly id: string
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    const removed = doc.removeFromParent(shape);
    this.parent = removed.parent;
    this.index = removed.index;
    this.snapshot = shape;
    doc.unregister(shape);
    return `${shape.typeName}#${shape.id} deleted`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    if (!this.snapshot || !this.parent) return "";
    doc.registerTree(this.snapshot);
    this.parent.addChild(this.snapshot, this.index);
    const parentLabel =
      this.parent.id === "__root__" ? "svg" : `g#${this.parent.id}`;
    return `${this.snapshot.typeName}#${this.snapshot.id} restored into ${parentLabel}`;
  }
}
