resource "azurerm_storage_account" "j1dev" {
  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = "eastus"
  account_replication_type = "LRS"
  account_tier = "Standard"

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_storage_container" "j1dev" {
  name = "j1dev"
  storage_account_name = azurerm_storage_account.j1dev.name
}

resource "azurerm_sql_server" "j1dev" {
  name                         = "j1dev-sqlserver"
  resource_group_name          = azurerm_resource_group.j1dev.name
  location                     = "eastus"
  version                      = "12.0"
  administrator_login          = random_string.administrator_login.result
  administrator_login_password = random_password.administrator_password.result

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_sql_database" "j1dev" {
  name                = "j1dev-sqldatabase"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = "eastus"
  server_name         = azurerm_sql_server.j1dev.name

  tags = {
    environment = "${local.j1env}"
  }
}

resource "random_string" "administrator_login" {
  length = 13
}

resource "random_password" "administrator_password" {
  length = 16
  special = true
}