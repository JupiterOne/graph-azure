import {
  DatabaseBlobAuditingPoliciesGetResponse,
  FirewallRule,
  ServerBlobAuditingPoliciesGetResponse,
  ServerSecurityAlertPoliciesGetResponse,
  TransparentDataEncryptionsGetResponse,
} from '@azure/arm-sql/esm/models';
import {
  createIntegrationEntity,
  Entity,
  setRawData,
} from '@jupiterone/integration-sdk-core';
import { entities } from './constants';

const ENABLED_PATTERN = /enabled/i;

export function setAuditingStatus(
  serverOrDatabaseEntity: Entity,
  auditing:
    | ServerBlobAuditingPoliciesGetResponse
    | DatabaseBlobAuditingPoliciesGetResponse
    | undefined,
): void {
  if (!auditing) return;

  setRawData(serverOrDatabaseEntity, { name: 'auditing', rawData: auditing });

  const auditStatus =
    auditing.state ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (auditing as any).content['m:properties']['d:properties']['d:state'];

  if (auditStatus) {
    Object.assign(serverOrDatabaseEntity, {
      auditingEnabled: ENABLED_PATTERN.test(auditStatus),
      loggingEnabled: ENABLED_PATTERN.test(auditStatus),
      auditLogDestination: auditing.storageEndpoint,
      auditActionsAndGroups: auditing.auditActionsAndGroups?.filter(
        (e) => e !== '',
      ),
      auditLogAccessKey: auditing.storageAccountAccessKey,
      auditLogRetentionDays: auditing.retentionDays,
      auditLogMonitorEnabled: auditing.isAzureMonitorTargetEnabled,
    });
  }
}

export function setServerSecurityAlerting(
  serverEntity: Entity,
  alerting: ServerSecurityAlertPoliciesGetResponse | undefined,
): void {
  if (!alerting) return;

  setRawData(serverEntity, { name: 'alerting', rawData: alerting });

  const alertStatus =
    alerting.state ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (alerting as any).content['m:properties']['d:properties']['d:state'];

  if (alertStatus) {
    const alertingEnabled = ENABLED_PATTERN.test(alertStatus);
    const alertEmails = alerting.emailAddresses?.filter((e) => e !== '');
    const alertsDisabled = alerting.disabledAlerts?.filter((e) => e !== '');
    const hasDisabledAlerts = alertsDisabled && alertsDisabled.length > 0;
    Object.assign(serverEntity, {
      alertingEnabled,
      alertAdmins: alerting.emailAccountAdmins,
      alertEmails,
      alertsDisabled,
      alertOnAllThreats: alertingEnabled && !hasDisabledAlerts,
    });
  }
}

export function setDatabaseEncryption(
  databaseEntity: Entity,
  encryption: TransparentDataEncryptionsGetResponse | undefined,
): void {
  if (!encryption) return;

  setRawData(databaseEntity, {
    name: 'encryption',
    rawData: encryption,
  });

  const status =
    encryption.status ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (encryption as any).content['m:properties']['d:properties']['d:status'];

  if (status) {
    databaseEntity.encrypted = ENABLED_PATTERN.test(status);
  }
}

export function createSqlServerFirewallRuleEntity(firewallRule: FirewallRule) {
  return createIntegrationEntity({
    entityData: {
      source: firewallRule,
      assign: {
        _key: firewallRule.id,
        _type: entities.FIREWALL_RULE._type,
        _class: entities.FIREWALL_RULE._class,
        name: firewallRule.name,
        id: firewallRule.id,
        category: ['host'],
        kind: firewallRule.kind,
        location: firewallRule.location,
        startIpAddress: firewallRule.startIpAddress,
        endIpAddress: firewallRule.endIpAddress,
      },
    },
  });
}
