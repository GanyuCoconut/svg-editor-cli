import { AttrMap, Shape } from "./Shape";

export class Group extends Shape {
  private children: Shape[] = [];

  constructor(id: string) {
    super(id);
  }

  get typeName(): string {
    return "g";
  }

  override isContainer(): boolean {
    return true;
  }

  override getChildren(): Shape[] {
    return [...this.children];
  }

  addChild(shape: Shape, index?: number): void {
    const prev = shape.getParent();
    if (prev && prev.isContainer()) {
      (prev as Group).removeChild(shape);
    }
    shape.setParent(this);
    if (index === undefined || index >= this.children.length) {
      this.children.push(shape);
    } else {
      this.children.splice(index, 0, shape);
    }
  }

  removeChild(shape: Shape): boolean {
    const idx = this.children.indexOf(shape);
    if (idx < 0) return false;
    this.children.splice(idx, 1);
    shape.setParent(null);
    return true;
  }

  indexOf(shape: Shape): number {
    return this.children.indexOf(shape);
  }

  moveChildToFront(shape: Shape): void {
    if (!this.removeChild(shape)) return;
    this.children.push(shape);
    shape.setParent(this);
  }

  moveChildToBack(shape: Shape): void {
    if (!this.removeChild(shape)) return;
    this.children.unshift(shape);
    shape.setParent(this);
  }

  moveBy(dx: number, dy: number): void {
    for (const child of this.children) {
      child.moveBy(dx, dy);
    }
  }

  scaleBy(factor: number): void {
    for (const child of this.children) {
      child.scaleBy(factor);
    }
  }

  getAttr(name: string): string | number | undefined {
    if (name === "fill" || name === "stroke" || name === "stroke-width") {
      return undefined;
    }
    return undefined;
  }

  setAttr(name: string, value: string): void {
    if (name === "fill" || name === "stroke" || name === "stroke-width") {
      for (const child of this.children) {
        try {
          child.setAttr(name, value);
        } catch {
          // skip children that do not support the attribute
        }
      }
      return;
    }
    throw new Error(`unknown attribute: ${name}`);
  }

  listAttrs(): AttrMap {
    return {};
  }

  clone(): Group {
    const g = new Group(this.id);
    for (const child of this.children) {
      g.addChild(child.clone());
    }
    return g;
  }

  toTreeLine(): string {
    return `g#${this.id}`;
  }

  /** Whether `candidate` is this group or nested inside it. */
  containsDescendant(candidate: Shape): boolean {
    if (candidate === this) return true;
    for (const child of this.children) {
      if (child === candidate) return true;
      if (child.isContainer() && (child as Group).containsDescendant(candidate)) {
        return true;
      }
    }
    return false;
  }
}
