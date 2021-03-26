locals {
  api_management_resource_count = var.azurerm_api_management_services == 1 ? 1 : 0
  api_management_apis_resource_count = var.azurerm_api_management_services == 1 && var.azurerm_api_management_apis == 1 ? 1 : 0
}

resource "azurerm_api_management" "j1dev" {
  count               = local.api_management_resource_count
  name                = "j1dev"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  publisher_name      = "JupiterOne"
  publisher_email     = "ndowmon@jupiterone.com"

  sku_name = "Developer_1"
}

data "azurerm_monitor_diagnostic_categories" "j1dev_api_mgmt_cat" {
  count       = local.api_management_resource_count
  resource_id = azurerm_api_management.j1dev[0].id
}

resource "azurerm_api_management_api" "example" {
  count               = local.api_management_resource_count
  name                = "j1dev-api"
  resource_group_name = azurerm_resource_group.j1dev.name
  api_management_name = azurerm_api_management.j1dev[0].name
  revision            = "1"
  display_name        = "j1dev API"
  path                = "j1dev/test"
  protocols           = ["https"]
}