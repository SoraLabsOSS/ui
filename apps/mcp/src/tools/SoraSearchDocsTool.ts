import { SearchDocsTool } from "@mcpframework/docs";
import { soraDocsSource } from "../docs/sora-docs-source.js";

class SoraSearchDocsTool extends SearchDocsTool {
  constructor() {
    super(soraDocsSource);
  }
}

export default SoraSearchDocsTool;
