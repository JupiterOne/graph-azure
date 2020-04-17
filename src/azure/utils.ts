/**
 * Normalizes locations to the most prominent form of lowercase with no spaces.
 *
 * @param location a location such as 'East US' or 'eastus'
 */
export function normalizeLocation(location?: string): string | undefined {
  if (location) {
    return location.toLowerCase().replace(/\s+/, "");
  }
}

const resourceGroupRegex = /\/resourceGroups\/(.*?)\//;

/**
 * Returns the `resource.name` or throws an error. Useful in situations where
 * you must have a name, such as when calling an API that requires the resource
 * name.
 *
 * @param resource anything with a name property, really
 */
export function resourceName(resource: { name?: string }): string {
  if (resource.name) {
    return resource.name;
  } else {
    throw new Error("Resource name is undefined!");
  }
}

export function resourceGroupName(
  id: string | undefined,
  required: true,
): string;

export function resourceGroupName(
  id: string | undefined,
  required?: boolean,
): string | undefined;

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
 * @param required optional, throw an error when the group name is not found in
 * the id
 * @returns the resource group name lowercased, or `undefined` when not found
 */
export function resourceGroupName(
  id: string | undefined,
  required = false,
): string | undefined {
  let name: string | undefined;

  if (id) {
    const m = resourceGroupRegex.exec(id);
    if (m) {
      name = m[1].toLowerCase();
    }
  }

  if (!name && required) {
    throw new Error(
      `Resource group name not found in '${id}' using '${resourceGroupRegex}`,
    );
  }

  return name;
}
