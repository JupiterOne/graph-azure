import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { fetchKeys, fetchKeyVaults } from '.';
import { entities, relationships } from './constants';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-keyvault-vaults', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    return { accountEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-keyvault-vaults',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity } = getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchKeyVaults(context);

    const keyVaultEntities = context.jobState.collectedEntities;

    expect(keyVaultEntities.length).toBeGreaterThan(0);
    expect(keyVaultEntities).toMatchGraphObjectSchema({
      _class: entities.KEY_VAULT._class,
    });

    // const keyVaultKeyRelationships = context.jobState.collectedRelationships;

    // expect(keyVaultEntities.length).toBe(keyVaultKeyRelationships.length);
    // expect(keyVaultKeyRelationships).toMatchDirectRelationshipSchema({
    //   schema: { properties: { _type: { const: relationships.KEY_VAULT_HAS_KEY._type }}},
    // });
  }, 10000);
});

describe('rm-keyvault-keys', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchKeyVaults(context);

    const j1devKeyVaultEntities = context.jobState.collectedEntities.filter(
      (e) => (e.name as string).endsWith('-j1dev'),
    );
    expect(j1devKeyVaultEntities).toHaveLength(1);

    return { accountEntity, keyVaultEntities: j1devKeyVaultEntities };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-keyvault-keys',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
        recordFailedRequests: true,
      },
    });

    const { accountEntity, keyVaultEntities } = await getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...keyVaultEntities],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchKeys(context);

    const keyEntities = context.jobState.collectedEntities;

    expect(keyEntities.length).toBeGreaterThan(0);
    expect(keyEntities).toMatchGraphObjectSchema({
      _class: entities.KEY._class,
      schema: entities.KEY.schema,
    });

    const keyVaultKeyRelationships = context.jobState.collectedRelationships;

    expect(keyEntities.length).toBe(keyVaultKeyRelationships.length);
    expect(keyVaultKeyRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: { _type: { const: relationships.KEY_VAULT_HAS_KEY._type } },
      },
    });
  }, 10000);
});
