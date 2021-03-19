import { createAccountEntity } from '../../src/steps/active-directory/converters';
import { v4 as uuid } from 'uuid';
import { IntegrationConfig } from '../../src/types';

export function getMockAccountEntity(config: IntegrationConfig) {
  return createAccountEntity({
    name: 'mock-account',
    id: uuid(),
    integrationDefinitionId: uuid(),
    accountId: uuid(),
    config,
  });
}
