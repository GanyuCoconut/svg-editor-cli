import { XMLParser } from "fast-xml-parser";
import { Circle } from "../model/Circle";
import { Document } from "../model/Document";
import { Ellipse } from "../model/Ellipse";
import { Group } from "../model/Group";
import { Line } from "../model/Line";
import { Rect } from "../model/Rect";
import { Shape } from "../model/Shape";
import { TextShape } from "../model/TextShape";

export interface ReadResult {
  document: Document;
  warnings: string[];
}

export class SvgReader {
  private warnings: string[] = [];
  private doc!: Document;

  read(xml: string): ReadResult {
    this.warnings = [];
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      preserveOrder: true,
      trimValues: true,
    });
    const ordered = parser.parse(xml) as Array<Record<string, unknown>>;
    const svgEntry = ordered.find((e) =>
      Object.prototype.hasOwnProperty.call(e, "svg")
    );
    if (!svgEntry) {
      throw new Error("cannot read file: invalid svg");
    }
    const svgChildren = svgEntry["svg"] as Array<Record<string, unknown>>;
    const svgAttrs = (svgEntry[":@"] as Record<string, string>) ?? {};
    const width = Number(svgAttrs["@_width"] ?? 800);
    const height = Number(svgAttrs["@_height"] ?? 600);
    this.doc = new Document(width, height);

    for (const child of svgChildren) {
      const shape = this.parseOrderedNode(child);
      if (shape) {
        this.doc.registerTree(shape);
        this.doc.getRoot().addChild(shape);
      }
    }
    return { document: this.doc, warnings: this.warnings };
  }

  private parseOrderedNode(node: Record<string, unknown>): Shape | null {
    const tag = Object.keys(node).find((k) => k !== ":@");
    if (!tag || tag === "#text") return null;
    const children = (node[tag] as Array<Record<string, unknown>>) ?? [];
    const rawAttrs = (node[":@"] as Record<string, string>) ?? {};
    const attrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawAttrs)) {
      attrs[k.replace(/^@_/, "")] = String(v);
    }

    let id = attrs.id;
    if (!id) {
      id = this.doc.allocateId(tag);
      this.warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
    }

    switch (tag) {
      case "rect":
        return new Rect(
          id,
          num(attrs.x),
          num(attrs.y),
          num(attrs.width),
          num(attrs.height),
          attrs.fill,
          attrs.stroke,
          optNum(attrs["stroke-width"])
        );
      case "circle":
        return new Circle(
          id,
          num(attrs.cx),
          num(attrs.cy),
          num(attrs.r),
          attrs.fill,
          attrs.stroke,
          optNum(attrs["stroke-width"])
        );
      case "ellipse":
        return new Ellipse(
          id,
          num(attrs.cx),
          num(attrs.cy),
          num(attrs.rx),
          num(attrs.ry),
          attrs.fill,
          attrs.stroke,
          optNum(attrs["stroke-width"])
        );
      case "line":
        return new Line(
          id,
          num(attrs.x1),
          num(attrs.y1),
          num(attrs.x2),
          num(attrs.y2),
          attrs.stroke,
          optNum(attrs["stroke-width"])
        );
      case "text": {
        const textNode = children.find((c) =>
          Object.prototype.hasOwnProperty.call(c, "#text")
        );
        const content = textNode ? String(textNode["#text"] ?? "") : "";
        return new TextShape(
          id,
          num(attrs.x),
          num(attrs.y),
          content,
          attrs.fill,
          attrs.stroke,
          optNum(attrs["stroke-width"])
        );
      }
      case "g": {
        const g = new Group(id);
        for (const child of children) {
          const s = this.parseOrderedNode(child);
          if (s) g.addChild(s);
        }
        return g;
      }
      default:
        return null;
    }
  }
}

function num(v: string | undefined): number {
  return Number(v ?? 0);
}

function optNum(v: string | undefined): number | undefined {
  return v === undefined ? undefined : Number(v);
}
