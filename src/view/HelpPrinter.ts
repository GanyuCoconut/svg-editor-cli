export class HelpPrinter {
  print(): string {
    return [
      "Commands:",
      "  init [w] [h]                         create empty canvas (default 800x600)",
      "  read <file.svg>                      load SVG as current document",
      "  save [file.svg]                      save current document",
      "  canvas [w] [h]                       show or resize canvas",
      "  create <type> <id> [params…] [in c]  create shape (rect/circle/ellipse/line/text/g)",
      "  delete <id>                          delete shape (and descendants)",
      "  move <id> <dx> <dy>                  translate",
      "  scale <id> <factor>                 uniform scale",
      "  set <id> <attr> <value>              set attribute",
      "  group <newGid> <id1> <id2>…         group shapes into new container",
      "  ungroup <gid>                        dissolve container",
      "  addto <gid> <id>                     move shape into container",
      "  front <id> / back <id>               z-order",
      "  tree [id]                            structure tree",
      "  show <id>                            attribute details",
      "  undo / redo                          undo / redo last edit",
      "  help                                 this help",
    ].join("\n");
  }
}
