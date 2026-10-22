import { Document } from "../model/Document";
import { Shape } from "../model/Shape";

export class TreePrinter {
  print(doc: Document, rootId?: string): string {
    if (rootId) {
      const shape = doc.getShape(rootId);
      if (!shape) {
        throw new Error(`no such shape: ${rootId}`);
      }
      return this.printNode(shape, "", true).join("\n");
    }
    const lines: string[] = [`svg (${doc.getWidth()}x${doc.getHeight()})`];
    const children = doc.getRoot().getChildren();
    children.forEach((child, i) => {
      const isLast = i === children.length - 1;
      lines.push(...this.printNode(child, "", isLast));
    });
    return lines.join("\n");
  }

  private printNode(shape: Shape, prefix: string, isLast: boolean): string[] {
    const branch = prefix === "" ? (isLast ? "└── " : "├── ") : (isLast ? "└── " : "├── ");
    // For root-level under svg, prefix starts empty and we use ├──/└──
    const linePrefix = prefix + branch;
    const lines = [`${linePrefix}${shape.toTreeLine()}`];
    if (shape.isContainer()) {
      const kids = shape.getChildren();
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      kids.forEach((kid, i) => {
        lines.push(...this.printNode(kid, childPrefix, i === kids.length - 1));
      });
    }
    return lines;
  }
}
