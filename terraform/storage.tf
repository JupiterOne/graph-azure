resource "azurerm_storage_account" "j1dev" {
  name                     = "j1dev"
  resource_group_name      = azurerm_resource_group.j1dev.name
  location                 = "eastus"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  account_tier             = "Standard"

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_storage_account" "j1dev_blobstorage" {
  name                     = "j1devblobstorage"
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

resource "azurerm_sql_server" "j1dev" {
  count = var.azurerm_storage_sql_servers

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

resource "azurerm_sql_database" "j1dev" {
  count = var.azurerm_storage_sql_databases

  name                = "j1dev-sqldatabase"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = "eastus"
  server_name         = azurerm_sql_server.j1dev[count.index].name

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_mysql_server" "j1dev" {
  count = var.azurerm_storage_mysql_servers

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

resource "azurerm_mysql_database" "j1dev" {
  count = var.azurerm_storage_mysql_databases

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

resource "random_string" "administrator_login" {
  length           = 13
  special          = true
  override_special = "_"
}

resource "random_password" "administrator_password" {
  length  = 16
  special = true
}
