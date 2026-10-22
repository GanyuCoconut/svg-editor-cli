import { Circle } from "../model/Circle";
import { Ellipse } from "../model/Ellipse";
import { Group } from "../model/Group";
import { Line } from "../model/Line";
import { Rect } from "../model/Rect";
import { Shape } from "../model/Shape";
import { TextShape } from "../model/TextShape";

export interface CreateParams {
  id: string;
  nums: number[];
  color?: string;
  text?: string;
}

/**
 * Shape factory — one of the two allowed name→type dispatch sites.
 * Marked for future plugin (ShapeProvider) refactor.
 */
export class ShapeFactory {
  create(type: string, params: CreateParams): Shape {
    switch (type) {
      case "rect":
        this.requireNums(type, params.nums, 4);
        return new Rect(
          params.id,
          params.nums[0],
          params.nums[1],
          params.nums[2],
          params.nums[3],
          params.color
        );
      case "circle":
        this.requireNums(type, params.nums, 3);
        return new Circle(
          params.id,
          params.nums[0],
          params.nums[1],
          params.nums[2],
          params.color
        );
      case "ellipse":
        this.requireNums(type, params.nums, 4);
        return new Ellipse(
          params.id,
          params.nums[0],
          params.nums[1],
          params.nums[2],
          params.nums[3],
          params.color
        );
      case "line":
        this.requireNums(type, params.nums, 4);
        return new Line(
          params.id,
          params.nums[0],
          params.nums[1],
          params.nums[2],
          params.nums[3],
          params.color
        );
      case "text":
        this.requireNums(type, params.nums, 2);
        if (params.text === undefined) {
          throw new Error("text content required");
        }
        return new TextShape(params.id, params.nums[0], params.nums[1], params.text);
      case "g":
        return new Group(params.id);
      default:
        throw new Error(
          `unknown shape type: ${type} (is the plugin loaded?)`
        );
    }
  }

  private requireNums(type: string, nums: number[], n: number): void {
    if (nums.length < n) {
      throw new Error(`not enough parameters for ${type}`);
    }
  }
}
