import { ListSectionsTool } from "@mcpframework/docs";
import { soraDocsSource } from "../docs/sora-docs-source.js";

class SoraListSectionsTool extends ListSectionsTool {
  constructor() {
    super(soraDocsSource);
  }
}

export default SoraListSectionsTool;
