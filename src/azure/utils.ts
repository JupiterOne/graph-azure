import { isInternet, isIpv4 } from '@jupiterone/integration-sdk-core';
import {
  getResourceGroupName,
  RESOURCE_GROUP_MATCHER,
} from '../steps/resource-manager/utils/matchers';

export const EVENT_GRID_DOMAIN_NAME_MATCHER = '(/domains/)([^/]*)';

/**
 * Normalizes locations to the most prominent form of lowercase with no spaces.
 *
 * @param location a location such as 'East US' or 'eastus'
 */
export function normalizeLocation(location?: string): string | undefined {
  if (location) {
    return location.toLowerCase().replace(/\s+/, '');
  }
}

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
    throw new Error('Resource name is undefined!');
  }
}

export function resourceGroupName(
  id: string | string[] | undefined,
  required: true,
): string;

export function resourceGroupName(
  id: string | string[] | undefined,
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
  id: string | string[] | undefined,
  required = false,
): string | undefined {
  let name: string | undefined;

  if (id && !Array.isArray(id)) {
    name = getResourceGroupName(id);
  }

  if (!name && required) {
    throw new Error(
      `Resource group name not found in '${id}' using '${RESOURCE_GROUP_MATCHER}`,
    );
  }

  return name;
}

/**
 * Extracts the Event Grid domain name from a resource id
 * @param id the resource id, which is expected to include the domain name
 * @returns the resource domain name, or `undefined` when not found
 */
export function getEventGridDomainNameFromId(
  id: string | string[] | undefined,
): string | undefined {
  let domainName: string | undefined;

  if (id && !Array.isArray(id)) {
    const domainNameRegex = new RegExp(EVENT_GRID_DOMAIN_NAME_MATCHER, 'g');
    const domainNameMatches = domainNameRegex.exec(id); // if no matches are found, this will return null
    if (domainNameMatches) {
      domainName = domainNameMatches[2] || undefined;
    }

    return domainName;
  }
}

/**
 * Checks if a list of addresses is an internet address.
 */
export function hasInternetAddress(addresses: string[]) {
  return addresses.some(
    (address) => address === '*' || (isIpv4(address) && isInternet(address)),
  );
}
