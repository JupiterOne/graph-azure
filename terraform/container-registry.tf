variable "create_container_registry_resources" {
  type    = number
  default = 0
}

locals {
  container_registry_resource_count = var.create_container_registry_resources == 1 ? 1 : 0
}

variable "azurerm_container_registry_webhook" {
  type    = number
  default = 0
}

resource "azurerm_container_registry" "j1dev" {
  count               = local.container_registry_resource_count
  name                = "${var.developer_id}j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = azurerm_resource_group.j1dev.location
  sku                 = "Basic"
}

data "azurerm_monitor_diagnostic_categories" "j1dev_cont_reg_cat" {
  count       = local.container_registry_resource_count
  resource_id = azurerm_container_registry.j1dev[0].id
}

resource "azurerm_container_registry_webhook" "j1dev" {
  count               = local.container_registry_resource_count
  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  registry_name       = azurerm_container_registry.j1dev[0].name
  location            = azurerm_resource_group.j1dev.location

  service_uri         = "https://mywebhookreceiver.example/mytag"
  actions             = ["push"]
}
