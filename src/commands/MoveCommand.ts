import { Circle } from "../model/Circle";
import { Ellipse } from "../model/Ellipse";
import { Line } from "../model/Line";
import { Rect } from "../model/Rect";
import { TextShape } from "../model/TextShape";
import { EditorContext } from "./EditorContext";
import { ICommand } from "./ICommand";

export class MoveCommand implements ICommand {
  readonly name = "move";
  readonly isEdit = true;
  readonly clearsHistory = false;

  private done = false;

  constructor(
    private readonly ctx: EditorContext,
    private readonly id: string,
    private readonly dx: number,
    private readonly dy: number
  ) {}

  execute(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape) {
      throw new Error(`no such shape: ${this.id}`);
    }
    shape.moveBy(this.dx, this.dy);
    this.done = true;
    if (shape.isContainer()) {
      return `g#${shape.id} moved by (${this.dx},${this.dy})`;
    }
    return `${shape.typeName}#${shape.id} moved to ${this.positionOf(shape)}`;
  }

  undo(): string {
    const doc = this.ctx.requireDocument();
    const shape = doc.getShape(this.id);
    if (!shape || !this.done) return "";
    shape.moveBy(-this.dx, -this.dy);
    if (shape.isContainer()) {
      return `g#${shape.id} moved back by (${-this.dx},${-this.dy})`;
    }
    return `${shape.typeName}#${shape.id} moved back to ${this.positionOf(shape)}`;
  }

  private positionOf(shape: Circle | Ellipse | Rect | TextShape | Line | { typeName: string }): string {
    if (shape instanceof Circle) return shape.positionSummary();
    if (shape instanceof Ellipse) return shape.positionSummary();
    if (shape instanceof Rect) return shape.positionSummary();
    if (shape instanceof TextShape) return shape.positionSummary();
    if (shape instanceof Line) return shape.positionSummary();
    return "";
  }
}
