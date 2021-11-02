import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { SecurityClient } from './client';
import {
  SecurityEntities,
  SecurityRelationships,
  SecuritySteps,
} from './constants';
import {
  createAssessmentEntity,
  createPricingConfigEntity,
  createSecurityCenterAutoProvisioningSettingEntity,
  createSecurityCenterSettingEntity,
  createSecurityContactEntity,
} from './converters';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources/constants';
import {
  entities as subscriptionEntities,
  steps as subscriptionSteps,
} from '../subscriptions/constants';

export async function fetchAssessments(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: subscriptionEntities.SUBSCRIPTION._type },
    async (subscriptionEntity) => {
      await client.iterateAssessments(
        subscriptionEntity._key,
        async (assessment) => {
          const assessmentEntity = await jobState.addEntity(
            createAssessmentEntity(webLinker, assessment),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              _class:
                SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT._class,
              from: subscriptionEntity,
              to: assessmentEntity,
              properties: {
                _type:
                  SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT._type,
              },
            }),
          );
        },
      );
    },
  );
}

export async function fetchSecurityCenterContacts(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  const subscriptionId = `/subscriptions/${instance.config.subscriptionId}`;
  const subscriptionEntity = await jobState.findEntity(subscriptionId);

  await client.iterateSecurityContacts(async (securityContact) => {
    const securityContactEntity = await jobState.addEntity(
      createSecurityContactEntity(webLinker, securityContact),
    );

    if (!subscriptionEntity) return;

    await jobState.addRelationship(
      createDirectRelationship({
        _class:
          SecurityRelationships.SUBSCRIPTION_HAS_SECURITY_CENTER_CONTACT._class,
        from: subscriptionEntity,
        to: securityContactEntity,
      }),
    );
  });
}

export async function fetchSecurityCenterPricingConfigurations(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  const subscriptionId = `/subscriptions/${instance.config.subscriptionId}`;
  const subscriptionEntity = await jobState.findEntity(subscriptionId);

  await client.iteratePricings(async (pricing) => {
    const pricingConfigEntity = await jobState.addEntity(
      createPricingConfigEntity(webLinker, pricing),
    );

    if (!subscriptionEntity) return;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: SecurityRelationships.SUBSCRIPTION_HAS_PRICING_CONFIG._class,
        from: subscriptionEntity,
        to: pricingConfigEntity,
        properties: {
          _type: SecurityRelationships.SUBSCRIPTION_HAS_PRICING_CONFIG._type,
        },
      }),
    );
  });
}

export async function fetchSecurityCenterSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  const subscriptionId = `/subscriptions/${instance.config.subscriptionId}`;
  const subscriptionEntity = await jobState.findEntity(subscriptionId);

  await client.iterateSettings(async (setting) => {
    const securityCenterSettingEntity = await jobState.addEntity(
      createSecurityCenterSettingEntity(webLinker, setting),
    );

    if (!subscriptionEntity) return;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: SecurityRelationships.SUBSCRIPTION_HAS_SETTING._class,
        from: subscriptionEntity,
        to: securityCenterSettingEntity,
        properties: {
          _type: SecurityRelationships.SUBSCRIPTION_HAS_SETTING._type,
        },
      }),
    );
  });
}

export async function fetchSecurityCenterAutoProvisioningSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new SecurityClient(instance.config, logger);

  const subscriptionId = `/subscriptions/${instance.config.subscriptionId}`;
  const subscriptionEntity = await jobState.findEntity(subscriptionId);

  await client.iterateAutoProvisioningSettings(async (setting) => {
    const securityCenterAutoProvisioningSettingEntity = await jobState.addEntity(
      createSecurityCenterAutoProvisioningSettingEntity(webLinker, setting),
    );

    if (!subscriptionEntity) return;

    await jobState.addRelationship(
      createDirectRelationship({
        _class:
          SecurityRelationships.SUBSCRIPTION_HAS_AUTO_PROVISIONING_SETTING
            ._class,
        from: subscriptionEntity,
        to: securityCenterAutoProvisioningSettingEntity,
        properties: {
          _type:
            SecurityRelationships.SUBSCRIPTION_HAS_AUTO_PROVISIONING_SETTING
              ._type,
        },
      }),
    );
  });
}

export const securitySteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: SecuritySteps.ASSESSMENTS,
    name: 'Security Assessments',
    entities: [SecurityEntities.ASSESSMENT],
    relationships: [SecurityRelationships.SUBSCRIPTION_PERFORMED_ASSESSMENT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchAssessments,
  },
  {
    id: SecuritySteps.SECURITY_CENTER_CONTACTS,
    name: 'Security Contacts',
    entities: [SecurityEntities.SECURITY_CENTER_CONTACT],
    relationships: [
      SecurityRelationships.SUBSCRIPTION_HAS_SECURITY_CENTER_CONTACT,
    ],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchSecurityCenterContacts,
  },
  {
    id: SecuritySteps.PRICING_CONFIGURATIONS,
    name: 'Security Center Pricing Configurations',
    entities: [SecurityEntities.SUBSCRIPTION_PRICING],
    relationships: [SecurityRelationships.SUBSCRIPTION_HAS_PRICING_CONFIG],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchSecurityCenterPricingConfigurations,
  },
  {
    id: SecuritySteps.SETTINGS,
    name: 'Security Center Settings',
    entities: [SecurityEntities.SETTING],
    relationships: [SecurityRelationships.SUBSCRIPTION_HAS_SETTING],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchSecurityCenterSettings,
  },
  {
    id: SecuritySteps.AUTO_PROVISIONING_SETTINGS,
    name: 'Security Center Auto-Provisioning Settings',
    entities: [SecurityEntities.AUTO_PROVISIONING_SETTING],
    relationships: [
      SecurityRelationships.SUBSCRIPTION_HAS_AUTO_PROVISIONING_SETTING,
    ],
    dependsOn: [STEP_AD_ACCOUNT, subscriptionSteps.SUBSCRIPTION],
    executionHandler: fetchSecurityCenterAutoProvisioningSettings,
  },
];
