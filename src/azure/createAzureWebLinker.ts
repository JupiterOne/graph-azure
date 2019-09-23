import { AzureWebLinker } from "./types";

export default function createAzureWebLinker(
  defaultDomain: string | undefined,
): AzureWebLinker {
  return {
    portalResourceUrl: path => {
      if (defaultDomain && path) {
        return `https://portal.azure.com/#@${defaultDomain}/resource${path}`;
      }
    },
  };
}
