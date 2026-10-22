# Lab1 Phase 1：SVG 编辑器（CLI）

## 仓库地址

- GitHub：https://github.com/GanyuCoconut/svg-editor-cli
- Tag：`final`

---

## 架构方案

### 1. 模块划分

| 模块（目录） | 职责 |
|---|---|
| `src/cli/` | REPL 入口：读行、注释跳过、提示符 `svg>`、行解析（`LineParser`） |
| `src/commands/` | Command 模式：`ICommand`、具体命令、`CommandRegistry`、`History`、`EditorContext` |
| `src/model/` | 领域模型：`Shape` 基类、叶子图形、`Group`（Composite）、`Document` |
| `src/io/` | SVG 读写：`SvgReader` / `SvgWriter`；缺 id 自动补全并告警 |
| `src/factory/` | `ShapeFactory`：类型名 → Shape 类 |
| `src/view/` | `tree` / `show` / `help` 格式化输出 |

#### 组件图（PlantUML）

```plantuml
@startuml
package "cli" {
  [Repl]
  [LineParser]
}

package "commands" {
  [CommandRegistry]
  [History]
  [EditorContext]
  interface ICommand
  [CreateCommand]
  [MoveCommand]
  [GroupCommand]
}

package "model" {
  [Document]
  abstract class Shape
  class Group
  class Rect
  Shape <|-- Group
  Shape <|-- Rect
  Document o-- Shape
  Group o-- Shape
}

package "factory" {
  [ShapeFactory]
}

package "io" {
  [SvgReader]
  [SvgWriter]
}

package "view" {
  [TreePrinter]
  [ShowPrinter]
}

[Repl] --> [CommandRegistry]
[CommandRegistry] --> ICommand
ICommand <|.. [CreateCommand]
[CreateCommand] --> [EditorContext]
[EditorContext] --> [Document]
[EditorContext] --> [ShapeFactory]
[EditorContext] --> [History]
[SvgReader] --> [Document]
[SvgWriter] --> [Document]
[TreePrinter] --> [Document]
@enduml
```

### 2. 设计模式的选择

| 模式 | 落地 |
|---|---|
| **Command（必选）** | 编辑命令实现 `execute()` / `undo()`；`History` 维护 undo/redo 栈；一条编辑命令 = 一个 undo 单元；IO 命令 `clearsHistory` 后禁止 undo |
| **Composite** | `Group` 与叶子同属 `Shape`；`move` / `scale` / `set` / `delete` 对容器与叶子统一入口 |
| **Factory** | `ShapeFactory.create(type, …)` 集中类型创建 |

按名字分派仅两处（方案标注为待插件化重构）：

1. `CommandRegistry.build`：命令名 → 命令类  
2. `ShapeFactory.create`：图形类型名 → 类  

### 3. 依赖方向规则

```
cli  →  commands  →  model
                 ↘  factory → model
commands / view / io  →  model
cli  →  view（显示类）
model  ↛  cli / io / commands
```

| 规则 | 理由 |
|---|---|
| `model` 不依赖外层 | 领域纯净，便于测试与后续 GUI 复用 |
| `commands` 依赖 `model` + `factory` | 命令编排领域操作 |
| `io` 只依赖 `model` | SVG ↔ Document 适配器 |
| `view` 只读 `model` | 显示不进 undo 栈 |

### 4. 变化点假设

| # | 变化点 | 应对 |
|---|---|---|
| 1 | 新增图形类型（`box` 等） | Factory / 后续 ShapeProvider；本阶段未知类型报错 |
| 2 | 新增编辑命令 | 实现 `ICommand` 并在 Registry 注册 |
| 3 | CLI → GUI / Agent | `model` + `commands` 与 `cli` 分离 |
| 4 | 属性白名单变化 | 集中在 `SetCommand` / 各 Shape |
| 5 | 复杂 transform 栈 | 本阶段直接改几何属性，**暂不预留** |

---

## 过程记录

1. **先定 Command + History，再铺具体命令**：避免事后补 undo。  
2. **AI 初稿中 `Document.unregister` 会递归删子 id**：`ungroup` 只需删容器自身 → 增加 `unregisterOne`。  
3. **读 SVG 用 `preserveOrder`**：普通解析会打乱同级标签顺序，与作业 `tree` 期望不一致。  
4. **对照 §6 / §6.1 会话脚本回放**：修正 group 非法嵌套错误文案、IO 后 undo 锁定、缺 id 警告格式。  
5. **`create … in <gid>`**：在 `LineParser.extractInClause` 解析，创建时即挂入容器，与事后 `group`/`addto` 分工明确。

---

## 一致性自查

1. **模块划分**：实际目录与方案表一致（`cli` / `commands` / `model` / `io` / `factory` / `view`）。  
2. **依赖方向**：`model` 无反向依赖；按名分派仅 `CommandRegistry` 与 `ShapeFactory`。

**修订记录**

| 日期 | 内容 |
|---|---|
| 2026-10-22 | 增加 `Document.unregisterOne`，修复 ungroup 误清子 id |
| 2026-10-22 | SvgReader 改为 preserveOrder，保证读回顺序 |

---

## 质量保证手段

| 手段 | 说明 |
|---|---|
| 会话回放 | 作业 §6 典型会话、§6.1 流程图案例均已脚本跑通 |
| 错误约定 | id 冲突、非法 group、IO 后 undo、无文档等输出 `error:` 前缀 |
| 往返 | `save` → `read`；缺 id 文件出现 `warning: assigned id rect1 to unnamed <rect>` |
| 类型检查 | `tsc --noEmit` 通过 |
| git | 分步提交，最终 tag `final` |

---

## 运行方式

```bash
npm install
npm run cli
```

提示符为 `svg>`，`#` 开头为注释。
