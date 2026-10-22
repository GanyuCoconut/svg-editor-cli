import { Circle } from "../model/Circle";
import { Document } from "../model/Document";
import { Ellipse } from "../model/Ellipse";
import { Group } from "../model/Group";
import { Line } from "../model/Line";
import { Shape } from "../model/Shape";
import { TextShape } from "../model/TextShape";
import { Rect } from "../model/Rect";

export class SvgWriter {
  write(doc: Document): string {
    const body = doc
      .getRoot()
      .getChildren()
      .map((c) => this.renderShape(c, 2))
      .join("\n");
    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.getWidth()}" height="${doc.getHeight()}" viewBox="0 0 ${doc.getWidth()} ${doc.getHeight()}">`,
      body,
      `</svg>`,
      "",
    ].join("\n");
  }

  private renderShape(shape: Shape, indent: number): string {
    const pad = " ".repeat(indent);
    if (shape instanceof Group) {
      const kids = shape
        .getChildren()
        .map((c) => this.renderShape(c, indent + 2))
        .join("\n");
      if (kids) {
        return `${pad}<g id="${this.esc(shape.id)}">\n${kids}\n${pad}</g>`;
      }
      return `${pad}<g id="${this.esc(shape.id)}"/>`;
    }
    if (shape instanceof Rect) {
      return `${pad}<rect${this.attrs(shape)}/>`;
    }
    if (shape instanceof Circle) {
      return `${pad}<circle${this.attrs(shape)}/>`;
    }
    if (shape instanceof Ellipse) {
      return `${pad}<ellipse${this.attrs(shape)}/>`;
    }
    if (shape instanceof Line) {
      return `${pad}<line${this.attrs(shape)}/>`;
    }
    if (shape instanceof TextShape) {
      const a = shape.listAttrs();
      const { text, ...rest } = a;
      const attrStr = Object.entries({ id: shape.id, ...rest })
        .map(([k, v]) => ` ${k}="${this.esc(String(v))}"`)
        .join("");
      return `${pad}<text${attrStr}>${this.esc(String(text ?? ""))}</text>`;
    }
    return `${pad}<!-- unknown ${shape.typeName}#${shape.id} -->`;
  }

  private attrs(shape: Shape): string {
    const a = shape.listAttrs();
    const parts = [` id="${this.esc(shape.id)}"`];
    for (const [k, v] of Object.entries(a)) {
      parts.push(` ${k}="${this.esc(String(v))}"`);
    }
    return parts.join("");
  }

  private esc(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
