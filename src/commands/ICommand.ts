/**
 * Command pattern interface.
 * Editing commands implement execute/undo for History.
 */
export interface ICommand {
  readonly name: string;
  /** true → recorded in undo stack; false → display/doc helpers */
  readonly isEdit: boolean;
  /** true → after execute, undo/redo become forbidden until next edit */
  readonly clearsHistory: boolean;

  execute(): string;
  undo(): string;
}
