# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
