import { Document } from "../model/Document";
import { TextShape } from "../model/TextShape";

export class ShowPrinter {
  print(doc: Document, id: string): string {
    const shape = doc.getShape(id);
    if (!shape) {
      throw new Error(`no such shape: ${id}`);
    }
    const parent = shape.getParent();
    const parentLabel =
      !parent || parent.id === "__root__"
        ? "svg"
        : `${parent.typeName}#${parent.id}`;
    const lines: string[] = [
      `${shape.typeName}#${shape.id}  parent=${parentLabel}`,
    ];
    const attrs = shape.listAttrs();
    if (shape instanceof TextShape) {
      lines.push(`  x=${attrs.x} y=${attrs.y}`);
      lines.push(`  text="${attrs.text}"`);
      if (attrs.fill !== undefined) lines.push(`  fill=${attrs.fill}`);
    } else if (shape.isContainer()) {
      lines.push(`  children=${shape.getChildren().length}`);
    } else {
      const geom = Object.entries(attrs)
        .filter(([k]) => !["fill", "stroke", "stroke-width"].includes(k))
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");
      if (geom) lines.push(`  ${geom}`);
      if (attrs.fill !== undefined) lines.push(`  fill=${attrs.fill}`);
      if (attrs.stroke !== undefined) lines.push(`  stroke=${attrs.stroke}`);
      if (attrs["stroke-width"] !== undefined) {
        lines.push(`  stroke-width=${attrs["stroke-width"]}`);
      }
    }
    return lines.join("\n");
  }
}
