variable "create_service_bus_resources" {
  type    = number
  default = 0
}

locals {
  service_bus_resource_count = var.create_service_bus_resources == 1 ? 1 : 0
}

resource "azurerm_servicebus_namespace" "j1dev" {
  count               = local.service_bus_resource_count
  name                = "${var.developer_id}j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = azurerm_resource_group.j1dev.location
  sku                 = "Standard"
}

resource "azurerm_servicebus_queue" "j1dev" {
  count               = local.service_bus_resource_count
  name                = "j1dev-queue"
  resource_group_name = azurerm_resource_group.j1dev.name
  namespace_name       = azurerm_servicebus_namespace.j1dev[0].name
}

resource "azurerm_servicebus_topic" "j1dev" {
  count               = local.service_bus_resource_count
  name                = "j1dev-topic"
  resource_group_name = azurerm_resource_group.j1dev.name
  namespace_name       = azurerm_servicebus_namespace.j1dev[0].name
}

resource "azurerm_servicebus_subscription" "j1dev" {
  count               = local.service_bus_resource_count
  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  namespace_name       = azurerm_servicebus_namespace.j1dev[0].name
  topic_name          = azurerm_servicebus_topic.j1dev[0].name
  max_delivery_count  = 1
}