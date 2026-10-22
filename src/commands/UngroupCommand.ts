import { Group } from "../model/Group";
import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class UngroupCommand implements ICommand {
  readonly name = "ungroup";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private group: Group | null = null;
  private parent: Group | null = null;
  private index = -1;
  private children: Shape[] = [];

  constructor(
    private readonly ctx: EditorContext,
    private readonly gid: string
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.gid);
    if (!shape) {
      throw new Error(`no such shape: ${this.gid}`);
    }
    if (!shape.isContainer()) {
      throw new Error(`not a container: ${this.gid}`);
    }
    const group = shape as Group;
    const parent = group.getParent() as Group | null;
    if (!parent) {
      throw new Error(`cannot ungroup top-level container: ${this.gid}`);
    }
    // top-level = direct child of synthetic root
    if (parent.id === "__root__") {
      throw new Error(`cannot ungroup top-level container: ${this.gid}`);
    }
    this.children = group.getChildren();
    this.parent = parent;
    this.index = parent.indexOf(group);
    this.group = group;

    parent.removeChild(group);
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      group.removeChild(child);
      parent.addChild(child, this.index + i);
    }
    doc.unregisterOne(group);
    return `g#${this.gid} ungrouped (${this.children.length} children promoted)`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    if (!this.group || !this.parent) return "";
    // pull children back into group
    for (const child of this.children) {
      this.parent.removeChild(child);
      this.group.addChild(child);
    }
    doc.register(this.group);
    this.parent.addChild(this.group, this.index);
    return `g#${this.group.id} restored`;
  }
}
