import { AttrMap, Shape } from "./Shape";

export class Ellipse extends Shape {
  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private rx: number,
    private ry: number,
    private fill?: string,
    private stroke?: string,
    private strokeWidth?: number
  ) {
    super(id);
  }

  get typeName(): string {
    return "ellipse";
  }

  moveBy(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scaleBy(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.rx *= factor;
    this.ry *= factor;
  }

  getAttr(name: string): string | number | undefined {
    switch (name) {
      case "cx":
        return this.cx;
      case "cy":
        return this.cy;
      case "rx":
        return this.rx;
      case "ry":
        return this.ry;
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
      case "rx":
        this.rx = Number(value);
        break;
      case "ry":
        this.ry = Number(value);
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
      cx: this.cx,
      cy: this.cy,
      rx: this.rx,
      ry: this.ry,
    };
    if (this.fill !== undefined) attrs.fill = this.fill;
    if (this.stroke !== undefined) attrs.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attrs["stroke-width"] = this.strokeWidth;
    return attrs;
  }

  clone(): Ellipse {
    return new Ellipse(
      this.id,
      this.cx,
      this.cy,
      this.rx,
      this.ry,
      this.fill,
      this.stroke,
      this.strokeWidth
    );
  }

  toTreeLine(): string {
    const fillPart = this.fill !== undefined ? ` fill=${this.fill}` : "";
    return `ellipse#${this.id}  cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}${fillPart}`;
  }

  positionSummary(): string {
    return `(${this.cx},${this.cy})`;
  }
}
