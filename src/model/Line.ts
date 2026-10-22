import { AttrMap, Shape } from "./Shape";

export class Line extends Shape {
  constructor(
    id: string,
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
    private stroke?: string,
    private strokeWidth?: number
  ) {
    super(id);
  }

  get typeName(): string {
    return "line";
  }

  moveBy(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  scaleBy(factor: number): void {
    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  getAttr(name: string): string | number | undefined {
    switch (name) {
      case "x1":
        return this.x1;
      case "y1":
        return this.y1;
      case "x2":
        return this.x2;
      case "y2":
        return this.y2;
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
      case "x1":
        this.x1 = Number(value);
        break;
      case "y1":
        this.y1 = Number(value);
        break;
      case "x2":
        this.x2 = Number(value);
        break;
      case "y2":
        this.y2 = Number(value);
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
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    };
    if (this.stroke !== undefined) attrs.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attrs["stroke-width"] = this.strokeWidth;
    return attrs;
  }

  clone(): Line {
    return new Line(
      this.id,
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      this.stroke,
      this.strokeWidth
    );
  }

  toTreeLine(): string {
    return `line#${this.id}          (${this.x1},${this.y1}) -> (${this.x2},${this.y2})`;
  }

  positionSummary(): string {
    return `(${this.x1},${this.y1})->(${this.x2},${this.y2})`;
  }
}
