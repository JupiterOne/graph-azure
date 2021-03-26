variable "azurerm_storage_postgresql_servers" {
  type    = number
  default = 0
}

variable "azurerm_storage_mariadb_servers" {
  type    = number
  default = 0
}

variable "azurerm_storage_mariadb_databases" {
  type    = number
  default = 0
}

locals {
  storage_postgresql_servers_count = var.azurerm_storage_postgresql_servers == 1 ? 1 : 0
  storage_sql_servers_count = var.azurerm_storage_sql_servers == 1 ? 1 : 0
  storage_sql_databases_count = var.azurerm_storage_sql_servers == 1 && var.azurerm_storage_sql_databases == 1 ? 1 : 0
  storage_mysql_servers_count = var.azurerm_storage_mysql_servers == 1 ? 1 : 0
  storage_mysql_databases_count = var.azurerm_storage_mysql_servers == 1 && var.azurerm_storage_mysql_databases == 1 ? 1 : 0
  storage_mariadb_servers_count = var.azurerm_storage_mariadb_servers == 1 ? 1 : 0
  storage_mariadb_databases_count = var.azurerm_storage_mariadb_servers == 1 && var.azurerm_storage_mariadb_databases == 1 ? 1 : 0
}

resource "azurerm_storage_account" "j1dev" {
  name                     = "${var.developer_id}j1dev"
  resource_group_name      = azurerm_resource_group.j1dev.name
  location                 = "eastus"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  account_tier             = "Standard"

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_storage_account_customer_managed_key" "j1dev" {
  storage_account_id = azurerm_storage_account.j1dev.id
  key_vault_id       = azurerm_key_vault.j1dev.id
  key_name           = azurerm_key_vault_key.j1dev.name
}

resource "azurerm_storage_account" "j1dev_blobstorage" {
  name                     = "${var.developer_id}j1devblobstorage"
  resource_group_name      = azurerm_resource_group.j1dev.name
  location                 = "eastus"
  account_replication_type = "LRS"
  account_kind             = "BlobStorage"
  account_tier             = "Standard"

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_storage_container" "j1dev" {
  name                 = "j1dev"
  storage_account_name = azurerm_storage_account.j1dev.name
}

resource "azurerm_storage_share" "j1dev" {
  name                 = "j1dev"
  storage_account_name = azurerm_storage_account.j1dev.name
  quota                = 1
}

resource "azurerm_storage_queue" "j1dev" {
  name                 = "j1dev"
  storage_account_name = azurerm_storage_account.j1dev.name
}

resource "azurerm_storage_table" "j1dev" {
  name                 = "j1dev"
  storage_account_name = azurerm_storage_account.j1dev.name
}

resource "azurerm_postgresql_server" "j1dev" {
  count               = local.storage_postgresql_servers_count
  name                = "j1dev-psqlserver"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  administrator_login          = random_string.administrator_login.result
  administrator_login_password = random_password.administrator_password.result

  sku_name   = "GP_Gen5_4"
  version    = "9.6"
  storage_mb = 640000

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = false

  public_network_access_enabled    = false
  ssl_enforcement_enabled          = true
  ssl_minimal_tls_version_enforced = "TLS1_2"
}

data "azurerm_monitor_diagnostic_categories" "j1dev_pgsql_cat" {
  count       = local.storage_postgresql_servers_count
  resource_id = azurerm_postgresql_server.j1dev[0].id
}

resource "azurerm_sql_server" "j1dev" {
  count = local.storage_sql_servers_count

  name                         = "j1dev-sqlserver"
  resource_group_name          = azurerm_resource_group.j1dev.name
  location                     = "eastus"
  version                      = "12.0"
  administrator_login          = random_string.administrator_login.result
  administrator_login_password = random_password.administrator_password.result

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_sql_firewall_rule" "j1dev" {
  count = local.storage_sql_servers_count

  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  server_name         = azurerm_sql_server.j1dev[0].name
  start_ip_address    = "10.0.17.62"
  end_ip_address      = "10.0.17.62"
}

data "azurerm_monitor_diagnostic_categories" "j1dev_sql_cat" {
  count       = local.storage_sql_servers_count
  resource_id = azurerm_sql_server.j1dev[0].id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_sql_diag_set" {
  count              = local.storage_sql_servers_count
  name               = "j1dev_sql_diag_set"
  target_resource_id = azurerm_sql_server.j1dev[0].id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_sql_cat[0].logs)
    content {
      category = log.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }

  dynamic metric {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_sql_cat[0].metrics)
    content {
      category = metric.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }
}

resource "azurerm_sql_database" "j1dev" {
  count = local.storage_sql_databases_count

  name                = "j1dev-sqldatabase"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = "eastus"
  server_name         = azurerm_sql_server.j1dev[count.index].name

  edition = "Free"

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_mysql_server" "j1dev" {
  count = local.storage_mysql_servers_count

  name                = "j1dev-mysqlserver"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  sku_name = "B_Gen5_2"

  storage_profile {
    storage_mb            = 5120
    backup_retention_days = 7
    geo_redundant_backup  = "Disabled"
  }

  administrator_login          = random_string.administrator_login.result
  administrator_login_password = random_password.administrator_password.result
  version                      = "5.7"
  ssl_enforcement              = "Enabled"

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_mysql_cat" {
  count       = local.storage_mysql_servers_count
  resource_id = azurerm_mysql_server.j1dev[0].id
}

resource "azurerm_mysql_database" "j1dev" {
  count = local.storage_mysql_databases_count

  name                = "j1dev-mysqldb"
  resource_group_name = azurerm_resource_group.j1dev.name
  server_name         = azurerm_mysql_server.j1dev[count.index].name
  charset             = "utf8"
  collation           = "utf8_unicode_ci"

  # Unsupported by resource at this time 😢
  # tags = {
  #   environment = local.j1env
  # }
}

resource "azurerm_mariadb_server" "j1dev" {
  count = local.storage_mariadb_servers_count

  name                = "j1dev-mariadb-server"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  sku_name = "B_Gen5_2"

  storage_mb                   = 51200
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  administrator_login          = random_string.administrator_login.result
  administrator_login_password = random_password.administrator_password.result
  version                      = "10.2"
  ssl_enforcement_enabled      = true
}

data "azurerm_monitor_diagnostic_categories" "j1dev_mariadb_cat" {
  count       = local.storage_mariadb_servers_count
  resource_id = azurerm_mariadb_server.j1dev[0].id
}

resource "azurerm_mariadb_database" "j1dev" {
  count = local.storage_mariadb_databases_count

  name                = "j1dev_mariadb_database"
  resource_group_name = azurerm_resource_group.j1dev.name
  server_name         = azurerm_mariadb_server.j1dev[0].name
  charset             = "utf8"
  collation           = "utf8_general_ci"
}

resource "random_string" "administrator_login" {
  length           = 13
  special          = true
  override_special = "_"
}

resource "random_password" "administrator_password" {
  length  = 16
  special = true
}
