export const EOL_MATCHER = '$';

export const SUBSCRIPTION_MATCHER = '/subscriptions/([^/]+)';
export const RESOURCE_GROUP_MATCHER =
  SUBSCRIPTION_MATCHER + '/resource[G|g]roups/([^/]+)';
/**
 * Returns true if `azureResourceId` contains valid resource group
 */
function containsResourceGroup(azureResourceId: string): boolean {
  return new RegExp(RESOURCE_GROUP_MATCHER).test(azureResourceId);
}

/**
 * /subscription/subscription-id/resourcegroup/RESOURCE_GROUP/provider/... ->
 * /subscription/subscription-id/resourcegroup/RESOURCE_GROUP
 */
function getNonNormalizedResourceGroupId(
  azureResourceId: string,
): string | undefined {
  if (containsResourceGroup(azureResourceId)) {
    return (azureResourceId.match(
      new RegExp(RESOURCE_GROUP_MATCHER),
    ) as RegExpMatchArray)[0];
  }
}

/**
 * /subscription/subscription-id/resourcegroup/RESOURCE_GROUP/provider/... ->
 * /subscription/subscription-id/resourceGroup/resource_group
 */
export function getResourceGroupId(
  azureResourceId: string,
): string | undefined {
  if (containsResourceGroup(azureResourceId)) {
    return (getNonNormalizedResourceGroupId(azureResourceId) as string).replace(
      new RegExp(RESOURCE_GROUP_MATCHER),
      (match, subscriptionId, resourceGroupId, offset, string) =>
        `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupId.toLowerCase()}`,
    );
  }
}

/**
 * /subscription/subscription-id/resourcegroup/RESOURCE_GROUP ->
 * resource_group
 */
export function getResourceGroupName(
  azureResourceId: string,
): string | undefined {
  if (containsResourceGroup(azureResourceId)) {
    return (getNonNormalizedResourceGroupId(
      azureResourceId,
    ) as string).replace(
      new RegExp(RESOURCE_GROUP_MATCHER),
      (match, subscriptionId, resourceGroupId, offset, string) =>
        resourceGroupId.toLowerCase(),
    );
  }
}
