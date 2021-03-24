import { fetchRecommendations } from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { AdvisorEntities, AdvisorRelationships } from './constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import {
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
} from '../key-vault';
import { entities as subscriptionEntities } from '../subscriptions/constants';
import { entities as storageEntities } from '../storage';
import { SecurityEntities } from '../security/constants';
import { ResourceRecommendationBase } from '@azure/arm-advisor/esm/models';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';

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

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      // ASSESSMENT ENTITIES
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev/providers/Microsoft.Security/assessments/88bbc99c-e5af-ddd7-6105-6150b2bfa519',
        _type: SecurityEntities.ASSESSMENT._type,
        _class: SecurityEntities.ASSESSMENT._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1dev/providers/Microsoft.Security/assessments/51fd8bb1-0db4-bbf1-7e2b-cfcba7eb66a6',
        _type: SecurityEntities.ASSESSMENT._type,
        _class: SecurityEntities.ASSESSMENT._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1devblobstorage/providers/Microsoft.Security/assessments/51fd8bb1-0db4-bbf1-7e2b-cfcba7eb66a6',
        _type: SecurityEntities.ASSESSMENT._type,
        _class: SecurityEntities.ASSESSMENT._class,
      },
      // SCOPE ENTITIES
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.keyvault/vaults/ndowmon1-j1dev',
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
      },
      {
        _key: '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7',
        _type: subscriptionEntities.SUBSCRIPTION._type,
        _class: subscriptionEntities.SUBSCRIPTION._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1dev',
        _type: storageEntities.STORAGE_ACCOUNT._type,
        _class: storageEntities.STORAGE_ACCOUNT._class,
      },
      {
        _key:
          '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/resourcegroups/j1dev/providers/microsoft.storage/storageaccounts/ndowmon1j1devblobstorage',
        _type: storageEntities.STORAGE_ACCOUNT._type,
        _class: storageEntities.STORAGE_ACCOUNT._class,
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

  const collectedEntitiesWithSourceProperty = collectedEntities.filter(
    (e) =>
      (e._rawData![0].rawData as ResourceRecommendationBase).resourceMetadata
        ?.source !== undefined,
  );

  const assessmentRelationships = collectedRelationships.filter(
    (r) => r._type === AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING._type,
  );
  expect(assessmentRelationships.length).toEqual(
    collectedEntitiesWithSourceProperty.length,
  );
  expect(assessmentRelationships).toMatchDirectRelationshipSchema({
    schema: {
      properties: {
        _class: {
          const: AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING._class,
        },
        _type: {
          const: AdvisorRelationships.ASSESSMENT_IDENTIFIED_FINDING._type,
        },
      },
    },
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
