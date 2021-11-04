import {
  buildAppToPlanRelationships,
  fetchApps,
  fetchAppServicePlans,
} from '.';
import { Recording } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { AppServiceEntities, AppServiceRelationships } from './constants';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
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

describe('rm-appservice-app-plan-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchApps(context);
    const webAppEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === AppServiceEntities.WEB_APP._type,
    );
    expect(webAppEntities.length).toBeGreaterThan(0);
    const functionAppEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === AppServiceEntities.FUNCTION_APP._type,
    );
    expect(functionAppEntities.length).toBeGreaterThan(0);

    await fetchAppServicePlans(context);
    const appServicePlanEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === AppServiceEntities.APP_SERVICE_PLAN._type,
    );
    expect(appServicePlanEntities.length).toBeGreaterThan(0);

    return { webAppEntities, functionAppEntities, appServicePlanEntities };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-appservice-app-plan-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      webAppEntities,
      functionAppEntities,
      appServicePlanEntities,
    } = await getSetupEntities(configFromEnv);

    const appEntities = [...webAppEntities, ...functionAppEntities];

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...appEntities, ...appServicePlanEntities],
    });

    await buildAppToPlanRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const appToPlanRelationships = context.jobState.collectedRelationships;
    expect(appToPlanRelationships.length).toBeGreaterThan(0);
    expect(appToPlanRelationships).toHaveLength(appEntities.length);

    expect(appToPlanRelationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            enum: [
              AppServiceRelationships.WEB_APP_USES_PLAN._type,
              AppServiceRelationships.FUNCTION_APP_USES_PLAN._type,
            ],
          },
        },
      },
    });
  });
});
