import { Group } from "./Group";
import { Shape } from "./Shape";

/**
 * Root SVG document / canvas. Children hang under a synthetic root group.
 */
export class Document {
  private readonly root: Group;
  private readonly index = new Map<string, Shape>();
  private filePath: string | null = null;
  private idCounters = new Map<string, number>();

  constructor(private width: number, private height: number) {
    this.root = new Group("__root__");
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  getFilePath(): string | null {
    return this.filePath;
  }

  setFilePath(path: string | null): void {
    this.filePath = path;
  }

  getRoot(): Group {
    return this.root;
  }

  countElements(): number {
    return this.index.size;
  }

  hasId(id: string): boolean {
    return this.index.has(id);
  }

  getShape(id: string): Shape | undefined {
    return this.index.get(id);
  }

  register(shape: Shape): void {
    if (this.index.has(shape.id)) {
      throw new Error(`id already exists: ${shape.id}`);
    }
    this.index.set(shape.id, shape);
  }

  /** Remove shape and all descendants from the id index. */
  unregister(shape: Shape): void {
    this.index.delete(shape.id);
    if (shape.isContainer()) {
      for (const child of shape.getChildren()) {
        this.unregister(child);
      }
    }
  }

  /** Remove only this shape's id (children remain indexed). */
  unregisterOne(shape: Shape): void {
    this.index.delete(shape.id);
  }

  /** Register shape and all descendants into the id index. */
  registerTree(shape: Shape): void {
    this.register(shape);
    if (shape.isContainer()) {
      for (const child of shape.getChildren()) {
        this.registerTree(child);
      }
    }
  }

  addToContainer(shape: Shape, containerId?: string): void {
    if (containerId === undefined) {
      this.root.addChild(shape);
      return;
    }
    const container = this.index.get(containerId);
    if (!container) {
      throw new Error(`no such container: ${containerId}`);
    }
    if (!container.isContainer()) {
      throw new Error(`not a container: ${containerId}`);
    }
    (container as Group).addChild(shape);
  }

  removeFromParent(shape: Shape): { parent: Group; index: number } {
    const parent = shape.getParent();
    if (!parent || !parent.isContainer()) {
      throw new Error(`no such shape: ${shape.id}`);
    }
    const group = parent as Group;
    const index = group.indexOf(shape);
    group.removeChild(shape);
    return { parent: group, index };
  }

  /** Allocate an id like rect1 when importing unnamed elements. */
  allocateId(tag: string): string {
    const key = tag.toLowerCase();
    let n = this.idCounters.get(key) ?? 0;
    let candidate: string;
    do {
      n += 1;
      candidate = `${key}${n}`;
    } while (this.index.has(candidate));
    this.idCounters.set(key, n);
    return candidate;
  }

  clear(): void {
    for (const child of this.root.getChildren()) {
      this.root.removeChild(child);
    }
    this.index.clear();
    this.idCounters.clear();
  }
}
