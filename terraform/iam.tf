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
  scope              = data.azurerm_subscription.j1dev.id
  role_definition_id = azurerm_role_definition.j1dev_subscription.id
  principal_id       = data.azurerm_client_config.current.object_id
}
