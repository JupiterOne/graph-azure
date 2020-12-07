# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `azure_diagnostic_log_setting` entities
- Added `azure_resource|has|azure_diagnostic_log_setting` relationships
- Added `azure_diagnostic_log_setting|uses|azure_storage_account` relationships
- Added `azure_diagnostic_metric_setting` entities
- Added `azure_resource|has|azure_diagnostic_metric_setting` relationships
- Added `azure_diagnostic_metric_setting|uses|azure_storage_account`
  relationships

## 5.8.1 - 2020-12-02

- Upgrade `@jupiterone/integration-sdk-*@5.0.0`

## 5.8.0 - 2020-12-01

### Added

- Added `azure_monitor_log_profile` entities
- Added `azure_subscription|has|azure_monitor_log_profile` relationships
- Added `azure_monitor_log_profile|uses|azure_storage_account` relationships
- Added `encryption.keySource` and `encryption.keyVaultProperties` to the
  `azure_storage_account` entity
- Added `allowBlobPublicAccess` to the `azure_storage_account` entity
- Added `azure_storage_account|uses|azure_keyvault_service` relationship

## 5.7.0 - 2020-11-05

### Added

- Added `azure_security_center_contact` entities
- Added `azure_subscription|has|azure_security_center_contact` relationships

## 5.6.0 - 2020-11-02

### Added

- Added `azure_policy_assignment` entities
- Added `ANY_SCOPE|has|azure_policy_assignment` relationships. These can target
  any scoped entity within Azure.

## 5.5.2 - 2020-10-29

### Changed

- Upgrade sdk to v4

## 5.5.1 - 2020-10-22

### Fixed

- [#187](https://github.com/JupiterOne/graph-azure/issues/187) - Throw
  `IntegrationValidationError` when invalid client secret is provided.
- [#185](https://github.com/JupiterOne/graph-azure/issues/185) - Handle
  `OperationNotAllowedOnKind` errors when storage accounts do not allow storage
  queues or storage tables
- Added `loggingEnabled` property on database entities
- [#182](https://github.com/JupiterOne/graph-azure/issues/182) - Disallow
  objects in `azure_storage_account.endpoints` array property

## 5.5.0 - 2020-10-19

### Added

- Added info-level logs when iterating Queues & Tables in storage accounts.
- Added the ability to execute specific steps in an integration last.
- Added a transformer so that `findEntity` uses case-insensitive matching.
- Added `azure_advisor_recommendation` entities
- Added `ANY_SCOPE|has|azure_advisor_recommendation` relationships. These can
  target any scoped entity within Azure.
- Added `azure_security_assessment` entities
- Added `azure_security_assessment|identified|azure_advisor_recommendation`
  relationships
- Added `azure_subscription|performed|azure_security_assessment` relationships

## 5.4.1 - 2020-10-13

### Fixed

- Don't throw if `createResourceGroupResourceRelationship` doesn't find the
  target resource group.
- Stop casting client `resourceEndpoint` arg to `ListResourcesEndpoint`

## 5.4.0 - 2020-10-07

### Added

- Added `azure_event_grid_domain` entities
- Added `azure_resource_group|has|azure_event_grid_domain` relationships
- Added `azure_event_grid_domain_topic` entities
- Added `azure_event_grid_domain|has|azure_event_grid_domain_topic`
  relationships
- Added `azure_event_grid_topic` entities
- Added `azure_resource_group|has|azure_event_grid_topic` relationships
- Added `azure_event_grid_topic_subscription` entities
- Added `azure_event_grid_topic|has|azure_event_grid_topic_subscription`
  relationship
- Added `azure_event_grid_domain_topic|has|azure_event_grid_topic_subscription`
  relationship
- Added `azure_batch_account` entities
- Added `azure_resource_group|has|azure_batch_account` relationships
- Added `azure_batch_pool` entities
- Added `azure_batch_account|has|azure_batch_pool` relationships
- Added `azure_batch_application` entities
- Added `azure_batch_account|has|azure_batch_application` relationships
- Added `azure_batch_certificate` entities
- Added `azure_batch_account|has|azure_batch_certificate` relationships
- Added `azure_redis_cache` entities
- Added `azure_resource_group|has|azure_redis_cache` relationships
- Added `azure_redis_firewall_rule` entities
- Added `azure_redis_cache|has|azure_redis_firewall_rule` relationships
- Added `azure_redis_cache|connects|azure_redis_cache` relationships
- Added `azure_container_group` entities
- Added `azure_resource_group|has|azure_container_group` relationships
- Added `azure_container` entities
- Added `azure_container_group|has|azure_container` relationships
- Added `azure_container_volume` entities
- Added `azure_container_group|has|azure_container_volume` relationships
- Added `azure_container|uses|azure_container_volume` relationships
- Added `azure_container_volume|uses|azure_storage_file_share` relationships

### Changed

- Upgraded SDK to v3.5.1

## 5.3.1 - 2020-09-21

### Fixed

- Removed `ingestResourceManager` which caused previously-configured
  integrations to stop ingesting resource manager steps

## 5.3.0 - 2020-09-21

- Added `azure_service_bus_namespace` entities
- Added `azure_resource_group|has|azure_service_bus_namespace` relationships
- Added `azure_service_bus_queue` entities
- Added `azure_service_bus_namespace|has|azure_service_bus_queue` relationships
- Added `azure_service_bus_topic` entities
- Added `azure_service_bus_namespace|has|azure_service_bus_topic` relationships
- Added `azure_service_bus_subscription` entities
- Added `azure_service_bus_topic|has|azure_service_bus_subscription`
  relationships
- Added `azure_cdn_profile` entities
- Added `azure_resource_group|has|azure_cdn_profile` relationships
- Added `azure_cdn_endpoint` entities
- Added `azure_cdn_profile|has|azure_cdn_endpoint` relationships

## 5.2.0 - 2020-09-20

### Added

- Added `ingestResourceManager` flag so that `Resource Manager` steps can be
  disabled
- Added `azure_dns_zone` entities
- Added `azure_resource_group|has|azure_dns_zone` relationships
- Added `azure_dns_record_set` entities
- Added `azure_dns_zone|has|azure_dns_record_set` relationships
- Added `azure_private_dns_zone` entities
- Added `azure_resource_group|has|azure_private_dns_zone` relationships
- Added `azure_private_dns_record_set` entities
- Added `azure_private_dns_zone|has|azure_private_dns_record_set` relationships
- Added `azure_container_registry` entities
- Added `azure_resource_group|has|azure_container_registry` relationships
- Added `azure_container_registry_webhook` entities
- Added `azure_container_registry|has|azure_container_registry_webhook`
  relationships

## 5.1.0 - 2020-09-09

### Added

- Added `azure_api_management_service` entities
- Added `azure_resource_group|has|azure_api_management_service` relationships
- Added `azure_api_management_api` entities
- Added `azure_api_management_service|has|azure_api_management_api`
  relationships

## 5.0.0 - 2020-09-04

### Added

- Added `azure_storage_table` entities
- Added `azure_storage_account|has|azure_storage_table` relationships
- Added `azure_storage_queue` entities
- Added `azure_storage_account|has|azure_storage_queue` relationships

### Removed

- Removed mapped `role_assignment|allows|<scope>` relationships to avoid
  creating `azure_unknown_resource_type` entities

### Changed

- Created `azure_storage_account` entities to replace
  `azure_storage_blob_service` and `azure_storage_file_service`. NOTE: This
  change requires any existing queries using the `azure_storage_blob_service` or
  `azure_storage_file_service` `_type` to use `azure_storage_account`.
- Upgraded SDK to v3.2.0, ordered entity/relationship docs

## 4.4.1 - 2020-09-02

### Fixed

- Fixed a bug where `resourceGroupId` needed to be case-insensitive

## 4.4.0 - 2020-09-01

### Fixed

- Fixed messaging for validateInvocation errors

## 4.3.0 - 2020-09-01

### Added

- Added `azure_role_assignment|allows|<scope>` relationships
- Added `azure_resource_group` entities
- Added `azure_resource_group|has|<resource>` relationships
- Added `azure_subscription` entities
- Added `azure_subscription|has|azure_resource_group` relationships

### Changed

- Upgraded to SDK version 3

### 4.2.1 - 2020-08-25

### Changed

- Updated classes on `azure_role_assignment-->azure_role_definition`
  relationship

## 4.2.0 - 2020-08-25

### Added

- Added `azure_role_assignment` entities; removed relationships
- Added `azure_role_assignment|assigned|<principal>` relationships
- Added `azure_role_assignment|has|azure_role_definition` relationships

### Changed

- Changed `generateEntityKey()` from `<_type>_<id>` to simply `<id>`

## 4.1.1 - 2020-08-18

### Changed

- Removed `sourceEntityType` bug from mapped relationships

## 4.1.0 - 2020-08-04

### Added

- Added `azure_role_definition` entities
- Added `azure_role_definition|assigned|<type>` relationships
- Added `azure_classic_admin_group` singleton entity
- Added `azure_classic_admin_group|has|azure_user` relationships
- Added `azure_service_principal` entities

### Fixed

- Security group rules step had wrong step function assigned, duplicated load
  balancer ingestion.
- Prefix globally unique terraform resources using `developer_id` environment
  variable.

## 4.0.1 - 2020-07-14

### Changed

- Added `User.username` for AD users, having the value of `userPrincipalName`,
  to satisfy the data model User schema requirement.

### Fixed

- Duplicate subnet -> vm relationships would cause the step to crash.
- Duplicate load balancer -> nic relationships would cause the step to crash.
- Illegal property `_integrationInstanceId` caused persister to reject uploads.
- Fix missing `name` on `User` and `UserGroup` entities.

## 4.0.0 - 2020-06-30

This release is a complete restructuring of the program to move to the new
JupiterOne integration SDK. Benefits are numerous, including:

- Use the latest patterns and allow for much easier advancement of the
  integration in all the ways intended by the new SDK
- Break work into more atomic steps, particularly helpful for database ingestion
- Allow for ingesting as much data as possible even when some data cannot be
  retrieved (partial sets)
- Significantly better error reporting, and statistics are collected
- Designed to run as a single process, dramatically simplifying deployments

## 3.16.3 - 2020-05-18

### Changed

- Filter out empty string in array list returned by Azure API on SQL Server
  auditing and alerting settings.

## 3.16.2 - 2020-05-18

### Changed

- Changed SQL server `alertAll` property to `alertOnAllThreats`.

## 3.16.1 - 2020-05-18

### Changed

- Set SQL server `alertAll: alertingEnabled && !hasDisabledAlerts`.

## 3.16.0 - 2020-05-18

### Added

- SQL Server and Database auditing status and properties.
- SQL Server alerting status and properties.

## 3.15.7 - 2020-05-17

### Added

- `attached` boolean and `state` property on `azure_managed_disk` entities.

## 3.15.6 - 2020-05-17

### Fixed

- Incorrect parsing the `targetPortRanges` (`fromPort` and `toPort`) of an Azure
  Security Group rule.

## 3.15.5 - 2020-05-06

### Changed

- Upgrade `@jupiterone/integration-sdk` to version `33.7.5`.

## 3.15.4 - 2020-05-06

### Added

- Logging in DB synchronization code, since there is so much going on in one
  step, cannot see how far it gets before failing.

## 3.15.3 - 2020-05-04

### Fixed

- SDK bug in `IntegrationCache.putEntries` that would duplicate keys and
  continually expand the keyspace, leading to infinite looping.

## 3.15.2 - 2020-05-04

### Added

- Log more details during group member fetching, group iteration.

## 3.15.1 - 2020-05-04

### Fixed

- NPM package for 3.15.0 has no `dist` directory, cannot import code.

## 3.15.0 - 2020-04-24

### Fixed

- Users are not related to groups of which they are a member.

### Added

- `encrypted` property on storage services (`azure_storage_*_service`).

## 3.14.0 - 2020-04-17

### Added

- Set `azure_managed_disk.encrypted` based on presence of `encryption.type`

- Key Vault resources: `azure_keyvault_service` (not yet loading keys, certs)

### Fixed

- Virtual networks listing sometimes produces a `502` server response. This
  would crash Compute synchronization. Virtual network sync is skipped in this
  case so other synchronization carries on.

- `_type` for images and disks was incorrect so that ingestion may have been
  unstable.

## 3.13.0 - 2020-04-17

### Added

- Additional properties on `azure_storage_*_service` entities: `kind`,
  `enableHttpsTrafficOnly`.

### Fixed

- `azure_storage_file_service.encrypted` property was reflecting the `blob`
  service encryption setting.

## 3.12.0 - 2020-04-16

### Added

- Storage resources: `azure_storage_file_service`, `azure_storage_share`

## 3.11.0 - 2020-04-15

### Added

- Cosmos DB resources: `azure_cosmosdb_account`, `azure_cosmosdb_sql_database`
