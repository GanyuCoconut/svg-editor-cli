import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

const COMMON = new Set(["fill", "stroke", "stroke-width"]);
const BY_TYPE: Record<string, Set<string>> = {
  rect: new Set(["x", "y", "width", "height", ...COMMON]),
  circle: new Set(["cx", "cy", "r", ...COMMON]),
  ellipse: new Set(["cx", "cy", "rx", "ry", ...COMMON]),
  line: new Set(["x1", "y1", "x2", "y2", "stroke", "stroke-width"]),
  text: new Set(["x", "y", "text", ...COMMON]),
  g: new Set([...COMMON]),
};

export class SetCommand implements ICommand {
  readonly name = "set";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private oldValue: string | undefined;
  private hadAttr = false;

  constructor(
    private readonly ctx: EditorContext,
    private readonly id: string,
    private readonly attr: string,
    private readonly value: string
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    const allowed = BY_TYPE[shape.typeName];
    if (!allowed || !allowed.has(this.attr)) {
      throw new Error(`unknown attribute: ${this.attr}`);
    }
    const prev = shape.getAttr(this.attr);
    this.hadAttr = prev !== undefined;
    this.oldValue = prev !== undefined ? String(prev) : undefined;
    shape.setAttr(this.attr, this.value);
    return `${shape.typeName}#${shape.id} updated: ${this.attr}="${this.value}"`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) return "";
    if (this.hadAttr && this.oldValue !== undefined) {
      shape.setAttr(this.attr, this.oldValue);
      return `${shape.typeName}#${shape.id} updated: ${this.attr}="${this.oldValue}"`;
    }
    // best-effort: set back empty / leave as is for newly added style attrs
    if (this.oldValue !== undefined) {
      shape.setAttr(this.attr, this.oldValue);
    }
    return `${shape.typeName}#${shape.id} updated: ${this.attr}="${this.oldValue ?? ""}"`;
  }
}
