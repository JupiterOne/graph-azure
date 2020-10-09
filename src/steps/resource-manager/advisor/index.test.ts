import { fetchRecommendations } from '.';
import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { AdvisorEntities, AdvisorRelationships } from './constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
} from '../key-vault';
import { SUBSCRIPTION_ENTITY_METADATA } from '../subscriptions';
import { STORAGE_ACCOUNT_ENTITY_METADATA } from '../storage';
let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - recommendations', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'resource-manager-step-recommendations',
  });

  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig,
    entities: [
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev',
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
      },
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
        _type: SUBSCRIPTION_ENTITY_METADATA._type,
        _class: SUBSCRIPTION_ENTITY_METADATA._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1dev',
        _type: STORAGE_ACCOUNT_ENTITY_METADATA._type,
        _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1devblobstorage',
        _type: STORAGE_ACCOUNT_ENTITY_METADATA._type,
        _class: STORAGE_ACCOUNT_ENTITY_METADATA._class,
      },
    ],
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRecommendations(context);

  const { collectedEntities, collectedRelationships } = context.jobState;
  expect(collectedEntities.length).toBeGreaterThan(0);
  expect(collectedEntities).toMatchGraphObjectSchema({
    _class: AdvisorEntities.RECOMMENDATION._class,
  });

  const resourceRelationships = collectedRelationships.filter(
    (r) => r._type === AdvisorRelationships.ANY_RESOURCE_HAS_FINDING._type,
  );
  expect(resourceRelationships.length).toEqual(collectedEntities.length);
  expect(resourceRelationships).toMatchDirectRelationshipSchema({
    schema: {
      properties: {
        _class: { const: AdvisorRelationships.ANY_RESOURCE_HAS_FINDING._class },
        _type: { const: AdvisorRelationships.ANY_RESOURCE_HAS_FINDING._type },
      },
    },
  });
});
