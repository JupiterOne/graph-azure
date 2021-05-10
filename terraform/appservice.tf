resource "azurerm_app_service_plan" "j1dev" {
  name                = "ASP-j1dev-function-app"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  kind                = "FunctionApp"
  reserved            = true

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "j1dev" {
  name                       = "${var.developer_id}-j1dev"
  location                   = azurerm_resource_group.j1dev.location
  resource_group_name        = azurerm_resource_group.j1dev.name
  app_service_plan_id        = azurerm_app_service_plan.j1dev.id
  storage_account_name       = azurerm_storage_account.j1dev.name
  storage_account_access_key = azurerm_storage_account.j1dev.primary_access_key
  enable_builtin_logging     = false
  os_type                    = "linux"
}

resource "azurerm_app_service_plan" "j1dev_web_app" {
  name                = "ASP-j1dev-web-app"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  kind                = "app"
  reserved            = false

  sku {
    tier = "Free"
    size = "F1"
  }
}

resource "azurerm_app_service" "j1dev_web_app" {
  name                       = "${var.developer_id}-j1dev-webapp"
  location                   = azurerm_resource_group.j1dev.location
  resource_group_name        = azurerm_resource_group.j1dev.name
  app_service_plan_id        = azurerm_app_service_plan.j1dev_web_app.id
  client_affinity_enabled    = true
}
