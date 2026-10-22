import { AttrMap, Shape } from "./Shape";

export class Rect extends Shape {
  constructor(
    id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private fill?: string,
    private stroke?: string,
    private strokeWidth?: number
  ) {
    super(id);
  }

  get typeName(): string {
    return "rect";
  }

  moveBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scaleBy(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  getAttr(name: string): string | number | undefined {
    switch (name) {
      case "x":
        return this.x;
      case "y":
        return this.y;
      case "width":
        return this.width;
      case "height":
        return this.height;
      case "fill":
        return this.fill;
      case "stroke":
        return this.stroke;
      case "stroke-width":
        return this.strokeWidth;
      default:
        return undefined;
    }
  }

  setAttr(name: string, value: string): void {
    switch (name) {
      case "x":
        this.x = Number(value);
        break;
      case "y":
        this.y = Number(value);
        break;
      case "width":
        this.width = Number(value);
        break;
      case "height":
        this.height = Number(value);
        break;
      case "fill":
        this.fill = value;
        break;
      case "stroke":
        this.stroke = value;
        break;
      case "stroke-width":
        this.strokeWidth = Number(value);
        break;
      default:
        throw new Error(`unknown attribute: ${name}`);
    }
  }

  listAttrs(): AttrMap {
    const attrs: AttrMap = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
    if (this.fill !== undefined) attrs.fill = this.fill;
    if (this.stroke !== undefined) attrs.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attrs["stroke-width"] = this.strokeWidth;
    return attrs;
  }

  clone(): Rect {
    return new Rect(
      this.id,
      this.x,
      this.y,
      this.width,
      this.height,
      this.fill,
      this.stroke,
      this.strokeWidth
    );
  }

  toTreeLine(): string {
    const fillPart = this.fill !== undefined ? ` fill=${this.fill}` : "";
    return `rect#${this.id}        x=${this.x} y=${this.y} w=${this.width} h=${this.height}${fillPart}`;
  }

  positionSummary(): string {
    return `(${this.x},${this.y})`;
  }
}
