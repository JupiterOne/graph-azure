resource "azurerm_role_definition" "j1dev_subscription" {
  name = "j1dev-subscription"
  scope = data.azurerm_subscription.j1dev.id
  assignable_scopes = [
    data.azurerm_subscription.j1dev.id,
  ]
  permissions {
    actions = ["*"]
  }
}
