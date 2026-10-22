import { Group } from "../model/Group";
import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class AddToCommand implements ICommand {
  readonly name = "addto";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private shape: Shape | null = null;
  private oldParent: Group | null = null;
  private oldIndex = -1;

  constructor(
    private readonly ctx: EditorContext,
    private readonly gid: string,
    private readonly id: string
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const container = doc.getShape(this.gid);
    if (!container) {
      throw new Error(`no such container: ${this.gid}`);
    }
    if (!container.isContainer()) {
      throw new Error(`not a container: ${this.gid}`);
    }
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    if (shape === container) {
      throw new Error(`cannot group a container into its own descendant: ${this.gid}`);
    }
    if (shape.isContainer() && (shape as Group).containsDescendant(container)) {
      throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    }
    if ((container as Group).containsDescendant(shape) && shape.getParent() === container) {
      // already direct child — still move to end
    }
    const oldParent = shape.getParent() as Group;
    this.oldParent = oldParent;
    this.oldIndex = oldParent.indexOf(shape);
    this.shape = shape;
    (container as Group).addChild(shape);
    return `${shape.typeName}#${shape.id} moved into g#${this.gid}`;
  }

  undo(): string {
    if (!this.shape || !this.oldParent) return "";
    this.oldParent.addChild(this.shape, this.oldIndex);
    return `${this.shape.typeName}#${this.shape.id} restored`;
  }
}
