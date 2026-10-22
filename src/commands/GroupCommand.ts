import { Group } from "../model/Group";
import { Shape } from "../model/Shape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

interface MemberSnap {
  shape: Shape;
  parent: Group;
  index: number;
}

export class GroupCommand implements ICommand {
  readonly name = "group";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private group: Group | null = null;
  private snaps: MemberSnap[] = [];
  private insertParent: Group | null = null;
  private insertIndex = 0;

  constructor(
    private readonly ctx: EditorContext,
    private readonly newGid: string,
    private readonly memberIds: string[]
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    if (doc.hasId(this.newGid)) {
      throw new Error(`id already exists: ${this.newGid}`);
    }
    const members: Shape[] = [];
    for (const id of this.memberIds) {
      const s = doc.getShape(id);
      if (!s) throw new Error(`no such shape: ${id}`);
      members.push(s);
    }

    // cannot group a container into its own descendant
    for (const a of members) {
      if (!a.isContainer()) continue;
      for (const b of members) {
        if (a === b) continue;
        if ((a as Group).containsDescendant(b)) {
          throw new Error(
            `cannot group a container into its own descendant: ${a.id}`
          );
        }
      }
    }

    this.snaps = [];
    for (const m of members) {
      const parent = m.getParent() as Group;
      this.snaps.push({ shape: m, parent, index: parent.indexOf(m) });
    }

    // insert new group at the position of the first member's parent slot
    const first = this.snaps[0];
    this.insertParent = first.parent;
    this.insertIndex = first.index;

    for (const snap of this.snaps) {
      snap.parent.removeChild(snap.shape);
    }

    const g = new Group(this.newGid);
    doc.register(g);
    for (const m of members) {
      g.addChild(m);
    }
    this.insertParent.addChild(g, this.insertIndex);
    this.group = g;
    return `g#${this.newGid} created with ${members.length} children`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    if (!this.group || !this.insertParent) return "";
    this.insertParent.removeChild(this.group);
    doc.unregister(this.group);
    // restore members in original parents (reverse order of snaps to keep indices stable)
    const ordered = [...this.snaps].sort((a, b) => a.index - b.index);
    for (const snap of ordered) {
      snap.parent.addChild(snap.shape, snap.index);
    }
    const id = this.group.id;
    this.group = null;
    return `g#${id} ungrouped`;
  }
}
