import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const USER_ENTITY_TYPE = "azure_user";
export const USER_ENTITY_CLASS = "User";

export interface UserEntity extends EntityFromIntegration {
  id: string;
  displayName?: string;
  givenName?: string;
  jobTitle?: string;
  mail?: string;
  mobilePhone?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  surname?: string;
  userPrincipalName?: string;
  employeeType?: string;
  employeeNumber?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  title?: string;
  manager?: string;
  managerId?: string;
  managerEmail?: string;
}
