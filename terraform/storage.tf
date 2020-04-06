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
  administrator_login          = "4dm1n157r470r"
  administrator_login_password = "4-v3ry-53cr37-p455w0rd"

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