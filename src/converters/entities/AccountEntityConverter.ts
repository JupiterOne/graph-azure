import { IntegrationInstance } from "@jupiterone/jupiter-managed-integration-sdk";
import { ACCOUNT_ENTITY_CLASS, ACCOUNT_ENTITY_TYPE, AccountEntity } from "../../jupiterone";
import { generateEntityKey } from "../../utils/generateKeys";

export function createAccountEntity(instance: IntegrationInstance): AccountEntity {
  return {
    _class: ACCOUNT_ENTITY_CLASS,
    _key: generateEntityKey(ACCOUNT_ENTITY_TYPE, instance.id),
    _type: ACCOUNT_ENTITY_TYPE,
    displayName: instance.name,
    cluster: instance.config.cluster,
  };
}
