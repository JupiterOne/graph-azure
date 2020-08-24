resource "azurerm_role_definition" "j1dev_subscription" {
  name              = "j1dev-subscription"
  scope             = data.azurerm_subscription.j1dev.id
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
  role_definition_id = azurerm_role_definition.j1dev_subscription.id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-group" {
  name               = "20000000-0000-0000-0000-000000000000"
  scope              = azurerm_resource_group.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.id
  principal_id       = data.azurerm_client_config.current.object_id
}

resource "azurerm_role_assignment" "j1dev-resource-keyvault" {
  name               = "30000000-0000-0000-0000-000000000000"
  scope              = azurerm_key_vault.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.id
  principal_id       = data.azurerm_client_config.current.object_id
}