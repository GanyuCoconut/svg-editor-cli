import { Group } from "../model/Group";
import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class ZOrderCommand implements ICommand {
  readonly name: string;
  readonly isEdit = true;
  readonly clearsHistory = false;

  private shape: Shape | null = null;
  private parent: Group | null = null;
  private oldIndex = -1;

  constructor(
    private readonly ctx: EditorContext,
    private readonly id: string,
    private readonly toFront: boolean
  ) {
    this.name = toFront ? "front" : "back";
  }

  execute(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    const parent = shape.getParent() as Group | null;
    if (!parent) {
      throw new Error(`no such shape: ${this.id}`);
    }
    this.shape = shape;
    this.parent = parent;
    this.oldIndex = parent.indexOf(shape);
    if (this.toFront) {
      parent.moveChildToFront(shape);
      return `${shape.typeName}#${shape.id} moved to front`;
    }
    parent.moveChildToBack(shape);
    return `${shape.typeName}#${shape.id} moved to back`;
  }

  undo(): string {
    if (!this.shape || !this.parent) return "";
    this.parent.removeChild(this.shape);
    this.parent.addChild(this.shape, this.oldIndex);
    return `${this.shape.typeName}#${this.shape.id} z-order restored`;
  }
}
