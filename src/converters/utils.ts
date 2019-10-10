const resourceGroupRegex = /\/resourceGroups\/(.*?)\//;

/**
 * Extracts the resource group name from a resource id and downcases it for
 * consistency across entities.
 *
 * Azure Resource Manager APIs return the resource group name inconsistently,
 * sometimes uppercased. See
 * https://github.com/Azure/azure-sdk-for-java/issues/1508 and
 * https://github.com/Azure/azure-sdk-for-java/issues/1708 for example.
 *
 * @param id the resource id, which is expected to include the resource group
 * @returns the resource group name lowercased, or `undefined` when not found
 */
export function resourceGroup(id: string | undefined): string | undefined {
  if (id) {
    const m = resourceGroupRegex.exec(id);
    if (m) {
      return m[1].toLowerCase();
    }
  }
}
