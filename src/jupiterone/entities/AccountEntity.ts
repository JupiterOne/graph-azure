import { EntityFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

export const ACCOUNT_ENTITY_TYPE = "azure_account";
export const ACCOUNT_ENTITY_CLASS = "Account";

export interface AccountEntity extends EntityFromIntegration {
  cluster: string;
}
