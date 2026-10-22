import { AttrMap, Shape } from "./Shape";

export class TextShape extends Shape {
  constructor(
    id: string,
    private x: number,
    private y: number,
    private content: string,
    private fill?: string,
    private stroke?: string,
    private strokeWidth?: number
  ) {
    super(id);
  }

  get typeName(): string {
    return "text";
  }

  getContent(): string {
    return this.content;
  }

  moveBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scaleBy(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  getAttr(name: string): string | number | undefined {
    switch (name) {
      case "x":
        return this.x;
      case "y":
        return this.y;
      case "text":
        return this.content;
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
      case "text":
        this.content = value;
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
    const attrs: AttrMap = { x: this.x, y: this.y, text: this.content };
    if (this.fill !== undefined) attrs.fill = this.fill;
    if (this.stroke !== undefined) attrs.stroke = this.stroke;
    if (this.strokeWidth !== undefined) attrs["stroke-width"] = this.strokeWidth;
    return attrs;
  }

  clone(): TextShape {
    return new TextShape(
      this.id,
      this.x,
      this.y,
      this.content,
      this.fill,
      this.stroke,
      this.strokeWidth
    );
  }

  toTreeLine(): string {
    return `text#${this.id}     (${this.x},${this.y}) "${this.content}"`;
  }

  positionSummary(): string {
    return `(${this.x},${this.y})`;
  }
}
