resource "azurerm_api_management" "j1dev" {
  count               = "${var.azurerm_api_management_services == 1 ? 1 : 0}"
  name                = "j1dev"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  publisher_name      = "JupiterOne"
  publisher_email     = "ndowmon@jupiterone.com"

  sku_name = "Developer_1"
}

resource "azurerm_api_management_api" "example" {
  count               = "${var.azurerm_api_management_services == 1 ? (var.azurerm_api_management_apis == 1 ? 1 : 0) : 0}"
  name                = "j1dev-api"
  resource_group_name = azurerm_resource_group.j1dev.name
  api_management_name = azurerm_api_management.j1dev[0].name
  revision            = "1"
  display_name        = "j1dev API"
  path                = "j1dev/test"
  protocols           = ["https"]
}