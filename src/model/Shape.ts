export type AttrMap = Record<string, string | number>;

/**
 * Abstract base for all SVG shapes (leaves and groups).
 * Composite: Group and leaves share the same command surface.
 */
export abstract class Shape {
  private parent: Shape | null = null;

  protected constructor(private readonly _id: string) {}

  get id(): string {
    return this._id;
  }

  getParent(): Shape | null {
    return this.parent;
  }

  /** @internal used by Document/Group when reparenting */
  setParent(parent: Shape | null): void {
    this.parent = parent;
  }

  abstract get typeName(): string;

  abstract moveBy(dx: number, dy: number): void;

  abstract scaleBy(factor: number): void;

  abstract getAttr(name: string): string | number | undefined;

  abstract setAttr(name: string, value: string): void;

  abstract listAttrs(): AttrMap;

  abstract clone(): Shape;

  abstract toTreeLine(): string;

  isContainer(): boolean {
    return false;
  }

  getChildren(): Shape[] {
    return [];
  }
}
