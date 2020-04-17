# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
