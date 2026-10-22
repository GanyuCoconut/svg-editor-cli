import { ICommand } from "./ICommand";

export class History {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private locked = false;

  lockAfterIo(): void {
    this.locked = true;
    this.undoStack = [];
    this.redoStack = [];
  }

  unlock(): void {
    this.locked = false;
  }

  isLocked(): boolean {
    return this.locked;
  }

  pushExecuted(cmd: ICommand): void {
    if (!cmd.isEdit) return;
    this.unlock();
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  undo(): string {
    if (this.locked) {
      throw new Error("undo not allowed after io command");
    }
    const cmd = this.undoStack.pop();
    if (!cmd) {
      throw new Error("nothing to undo");
    }
    const msg = cmd.undo();
    this.redoStack.push(cmd);
    return msg;
  }

  redo(): string {
    if (this.locked) {
      throw new Error("undo not allowed after io command");
    }
    const cmd = this.redoStack.pop();
    if (!cmd) {
      throw new Error("nothing to redo");
    }
    const msg = cmd.execute();
    this.undoStack.push(cmd);
    return msg;
  }
}
