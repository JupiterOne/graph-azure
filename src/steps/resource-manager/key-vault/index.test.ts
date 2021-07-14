import {
  MockIntegrationStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import {
  ACCOUNT_ENTITY_TYPE,
  fetchGroups,
  fetchServicePrincipals,
  fetchUsers,
  GROUP_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  USER_ENTITY_TYPE,
} from '../../active-directory';
import { buildKeyVaultAccessPolicyRelationships, fetchKeyVaults } from '.';
import {
  KeyVaultEntities,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from './constants';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';

let recording: Recording;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;
let instanceConfig: IntegrationConfig;

describe('step = key vaults', () => {
  beforeAll(async () => {
    instanceConfig = {
      clientId: process.env.CLIENT_ID || 'clientId',
      clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
      directoryId: '4a17becb-fb42-4633-b5c8-5ab66f28d195',
      subscriptionId: '87f62f44-9dad-4284-a08f-f2fb3d8b528a',
      developerId: 'keionned',
    };

    context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}`,
          _class: ['Account'],
          _type: 'azure_subscription',
          id: `/subscriptions/${instanceConfig.subscriptionId}`,
        },
        {
          _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
          _type: 'azure_resource_group',
          _class: ['Group'],
          name: 'j1dev',
          location: 'eastus',
          id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: {
          defaultDomain: 'www.fake-domain.com',
          _type: ACCOUNT_ENTITY_TYPE,
          _key: 'azure_account_id',
          id: 'azure_account_id',
        },
      },
    });

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-key-vaults',
    });

    await fetchKeyVaults(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should collect an Azure Key Vault entity', () => {
    const { collectedEntities } = context.jobState;

    expect(collectedEntities).toContainEqual(
      expect.objectContaining({
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        category: ['infrastructure'],
        displayName: `${instanceConfig.developerId}1-j1dev`,
        region: 'eastus',
        resourceGroup: 'j1dev',
        endpoints: [
          `https://${instanceConfig.developerId}1-j1dev.vault.azure.net/`,
        ],
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      }),
    );
  });

  it('should collect an Azure Account has Azure Key Vault relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: 'azure_account_id',
      _key: `azure_account_id|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _type: 'azure_account_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  it('should collect an Azure Resource Group has Azure Key Vault relationship', () => {
    const { collectedRelationships } = context.jobState;

    expect(collectedRelationships).toContainEqual({
      _class: 'HAS',
      _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
      _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.KeyVault/vaults/${instanceConfig.developerId}1-j1dev`,
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });
});

describe('rm-keyvault-principal-relationships', () => {
  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchKeyVaults(context);
    const keyVaultEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === KeyVaultEntities.KEY_VAULT._type,
    );
    expect(keyVaultEntities.length).toBeGreaterThan(0);

    await fetchUsers(context);
    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === USER_ENTITY_TYPE,
    );
    expect(userEntities.length).toBeGreaterThan(0);

    await fetchGroups(context);
    const groupEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === GROUP_ENTITY_TYPE,
    );
    expect(groupEntities.length).toBeGreaterThan(0);

    await fetchServicePrincipals(context);
    const servicePrincipalEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === SERVICE_PRINCIPAL_ENTITY_TYPE,
    );
    expect(servicePrincipalEntities.length).toBeGreaterThan(0);

    return {
      keyVaultEntities,
      principals: {
        userEntities,
        groupEntities,
        servicePrincipalEntities,
      },
    };
  }

  test('sucess', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-keyvault-principal-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { keyVaultEntities, principals } = await getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: keyVaultEntities,
    });

    await buildKeyVaultAccessPolicyRelationships(context);

    const keyVaultPrincipalMappedRelationships =
      context.jobState.collectedRelationships;

    expect(keyVaultPrincipalMappedRelationships).toTargetEntities([
      ...principals.userEntities,
      ...principals.groupEntities,
      ...principals.servicePrincipalEntities,
    ]);
  }, 10_000);
});
