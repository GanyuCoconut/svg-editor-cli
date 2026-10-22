import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class CreateCommand implements ICommand {
  readonly name = "create";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private created: Shape | null = null;

  constructor(
    private readonly ctx: EditorContext,
    private readonly type: string,
    private readonly id: string,
    private readonly nums: number[],
    private readonly color: string | undefined,
    private readonly text: string | undefined,
    private readonly containerId: string | undefined
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    if (doc.hasId(this.id)) {
      throw new Error(`id already exists: ${this.id}`);
    }
    const shape = this.ctx.factory.create(this.type, {
      id: this.id,
      nums: this.nums,
      color: this.color,
      text: this.text,
    });
    if (this.containerId !== undefined) {
      if (!doc.hasId(this.containerId)) {
        throw new Error(`no such container: ${this.containerId}`);
      }
      const c = doc.getShape(this.containerId)!;
      if (!c.isContainer()) {
        throw new Error(`not a container: ${this.containerId}`);
      }
    }
    doc.register(shape);
    doc.addToContainer(shape, this.containerId);
    this.created = shape;
    if (this.containerId) {
      return `${shape.typeName}#${shape.id} created in g#${this.containerId}`;
    }
    return `${shape.typeName}#${shape.id} created`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    if (!this.created) return "";
    doc.removeFromParent(this.created);
    doc.unregister(this.created);
    const id = this.created.id;
    const type = this.created.typeName;
    this.created = null;
    return `${type}#${id} deleted`;
  }
}
