import { fetchApps, fetchAppServicePlans } from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AppServiceEntities, AppServiceRelationships } from './constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import {
  getMockAccountEntity,
  getMockResourceGroupEntity,
} from '../../../../test/helpers/getMockEntity';
import { Entity } from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-appservice-apps', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const resourceGroupEntity = getMockResourceGroupEntity('j1dev');

    return { accountEntity, resourceGroupEntity };
  }

  function separateAppEntities(collectedEntities: Entity[]) {
    const {
      targets: webAppEntities,
      rest: restAfterWebApps,
    } = filterGraphObjects(
      collectedEntities,
      (e) => e._type === AppServiceEntities.WEB_APP._type,
    );
    const {
      targets: functionAppEntities,
      rest: restAfterFunctionApps,
    } = filterGraphObjects(
      restAfterWebApps,
      (e) => e._type === AppServiceEntities.FUNCTION_APP._type,
    );
    return {
      webAppEntities,
      functionAppEntities,
      rest: restAfterFunctionApps,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-appservice-apps',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, resourceGroupEntity } = getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchApps(context);

    const {
      webAppEntities,
      functionAppEntities,
      rest: restEntities,
    } = separateAppEntities(context.jobState.collectedEntities);

    expect(webAppEntities.length).toBeGreaterThan(0);
    expect(webAppEntities).toMatchGraphObjectSchema({
      _class: AppServiceEntities.WEB_APP._class,
    });

    expect(functionAppEntities.length).toBeGreaterThan(0);
    expect(functionAppEntities).toMatchGraphObjectSchema({
      _class: AppServiceEntities.FUNCTION_APP._class,
    });

    expect(restEntities).toHaveLength(0);

    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            enum: [
              AppServiceRelationships.RESOURCE_GROUP_HAS_WEB_APP._type,
              AppServiceRelationships.RESOURCE_GROUP_HAS_FUNCTION_APP._type,
            ],
          },
        },
      },
    });
  });
});

describe('rm-appservice-app-service-plans', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const resourceGroupEntity = getMockResourceGroupEntity('j1dev');

    return { accountEntity, resourceGroupEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-appservice-app-service-plans',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const { accountEntity, resourceGroupEntity } = getSetupEntities(
      configFromEnv,
    );

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [resourceGroupEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchAppServicePlans(context);

    const appServicePlanEntities = context.jobState.collectedEntities;

    expect(appServicePlanEntities.length).toBeGreaterThan(0);
    expect(appServicePlanEntities).toMatchGraphObjectSchema({
      _class: AppServiceEntities.APP_SERVICE_PLAN._class,
    });

    expect(
      context.jobState.collectedRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const:
              AppServiceRelationships.RESOURCE_GROUP_HAS_APP_SERVICE_PLAN._type,
          },
        },
      },
    });
  });
});
