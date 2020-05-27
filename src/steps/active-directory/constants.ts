// Step IDs
export const STEP_AD_ACCOUNT = 'ad-account';
export const STEP_AD_GROUPS = 'ad-groups';
export const STEP_AD_GROUP_MEMBERS = 'ad-group-members';
export const STEP_AD_USERS = 'ad-users';

// Graph objects
export const ACCOUNT_ENTITY_TYPE = 'azure_account';
export const ACCOUNT_ENTITY_CLASS = 'Account';

export const GROUP_ENTITY_TYPE = 'azure_user_group';
export const GROUP_ENTITY_CLASS = 'UserGroup';

export const USER_ENTITY_TYPE = 'azure_user';
export const USER_ENTITY_CLASS = 'User';

/**
 * The entity type used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_TYPE = 'azure_group_member';

/**
 * The entity class used for members of groups which are not one of the ingested
 * directory objects.
 */
export const GROUP_MEMBER_ENTITY_CLASS = 'User';

export const ACCOUNT_GROUP_RELATIONSHIP_TYPE = 'azure_account_has_group';
export const ACCOUNT_USER_RELATIONSHIP_TYPE = 'azure_account_has_user';
export const GROUP_MEMBER_RELATIONSHIP_TYPE = 'azure_group_has_member';
