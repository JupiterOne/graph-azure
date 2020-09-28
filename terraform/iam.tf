resource "azurerm_role_definition" "j1dev_subscription" {
  name  = "j1dev-subscription"
  scope = data.azurerm_subscription.j1dev.id
  assignable_scopes = [
    data.azurerm_subscription.j1dev.id,
  ]
  permissions {
    actions = ["*"]
  }
}

resource "azurerm_role_assignment" "j1dev" {
  name               = "10000000-0000-0000-0000-000000000000"
  scope              = data.azurerm_subscription.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-group" {
  name               = "20000000-0000-0000-0000-000000000000"
  scope              = azurerm_resource_group.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-keyvault" {
  name               = "30000000-0000-0000-0000-000000000000"
  scope              = azurerm_key_vault.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-network-interface" {
  name               = "40000000-0000-0000-0000-000000000000"
  scope              = azurerm_network_interface.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-security-group" {
  name               = "50000000-0000-0000-0000-000000000000"
  scope              = azurerm_network_security_group.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-public-ip" {
  name               = "60000000-0000-0000-0000-000000000000"
  scope              = azurerm_public_ip.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-virtual-network" {
  name               = "70000000-0000-0000-0000-000000000000"
  scope              = azurerm_virtual_network.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-cosmosdb-account" {
  name               = "80000000-0000-0000-0000-000000000000"
  scope              = azurerm_cosmosdb_account.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.role_definition_resource_id
  principal_id       = data.azurerm_client_config.current.object_id
}
