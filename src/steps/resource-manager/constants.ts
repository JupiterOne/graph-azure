/**
 * ANY_SCOPE is used to describe any Azure scope.
 * It includes non-resourced based Azure scopes, such as Azure Subscriptions and Azure Resource Groups.
 */
export const ANY_SCOPE = 'ANY_SCOPE';

/**
 * ANY_RESOURCE is used to describe any Azure resource.
 * It does NOT include non-resourced based Azure scopes, such as Azure Subscriptions and Azure Resource Groups.
 */
export const ANY_RESOURCE = 'ANY_RESOURCE';

/**
 * ANY_PRINCIPAL is used to describe any entra id principal.
 * It includes users, groups, and service principals.
 */
export const ANY_PRINCIPAL = 'ANY_PRINCIPAL';
