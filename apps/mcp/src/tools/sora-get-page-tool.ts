import { GetPageTool } from "@mcpframework/docs";
import { soraDocsSource } from "../docs/sora-docs-source.js";

class SoraGetPageTool extends GetPageTool {
  constructor() {
    super(soraDocsSource);
  }
}

export default SoraGetPageTool;
