import { AttrMap, Shape } from "./Shape";

export class Circle extends Shape {
  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private r: number,
    private fill?: string,
    private stroke?: string,
    private strokeWidth?: number
  ) {
    super(id);
  }

  get typeName(): string {
    return "circle";
  }

  moveBy(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scaleBy(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.r *= factor;
  }

  getAttr(name: string): string | number | undefined {
    switch (name) {
      case "cx":
        return this.cx;
      case "cy":
        return this.cy;
      case "r":
        return this.r;
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
      case "cx":
        this.cx = Number(value);
        break;
      case "cy":
        this.cy = Number(value);
        break;
      case "r":
        this.r = Number(value);
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
    const attrs: AttrMap = { cx: this.cx, cy: this.cy, r: this.r };
    if (this.fill !== undefined) attrs.fill = this.fill;
    if (this.stroke !== undefined) attrs.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attrs["stroke-width"] = this.strokeWidth;
    return attrs;
  }

  clone(): Circle {
    return new Circle(
      this.id,
      this.cx,
      this.cy,
      this.r,
      this.fill,
      this.stroke,
      this.strokeWidth
    );
  }

  toTreeLine(): string {
    const fillPart = this.fill !== undefined ? ` fill=${this.fill}` : "";
    return `circle#${this.id}  cx=${this.cx} cy=${this.cy} r=${this.r}${fillPart}`;
  }

  positionSummary(): string {
    return `(${this.cx},${this.cy})`;
  }
}
