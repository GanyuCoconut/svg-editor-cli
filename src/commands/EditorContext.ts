import { Document } from "../model/Document";
import { ShapeFactory } from "../factory/ShapeFactory";
import { History } from "./History";

/** Shared runtime state for all commands. */
export class EditorContext {
  document: Document | null = null;
  readonly history = new History();
  readonly factory = new ShapeFactory();

  requireDocument(): Document {
    if (!this.document) {
      throw new Error("no document. use 'init' or 'read' first");
    }
    return this.document;
  }
}
