variable "create_monitor_log_profile" {
  type    = number
  default = 0
}

locals {
  monitor_log_profile_count = var.create_monitor_log_profile == 1 ? 1 : 0
}

resource "azurerm_eventhub_namespace" "j1dev_log_profile_eventhub" {
  count = local.monitor_log_profile_count
  # The eventhub namespace name can contain only letters, numbers and hyphens. The namespace must start with a letter, and it must end with a letter or number and be between 6 and 50 characters long.
  name                = "j1dev-log-profile-eventhub"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  sku                 = "Standard"
  capacity            = 2
}

resource "azurerm_monitor_log_profile" "j1dev_log_profile" {
  count = local.monitor_log_profile_count
  name  = "default"

  categories = [
    "Action",
    "Delete",
    "Write",
  ]

  locations = [
    "eastus",
    "westus",
    "global",
  ]

  # RootManageSharedAccessKey is created by default with listen, send, manage permissions
  servicebus_rule_id = "${azurerm_eventhub_namespace.j1dev_log_profile_eventhub[0].id}/authorizationrules/RootManageSharedAccessKey"
  storage_account_id = azurerm_storage_account.j1dev.id

  retention_policy {
    enabled = true
    days    = 365
  }
}

resource "azurerm_monitor_activity_log_alert" "j1dev" {
  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  scopes              = [data.azurerm_subscription.j1dev.id]

  criteria {
    operation_name = "Microsoft.Authorization/policyAssignments/write"
    category       = "Administrative"
  }
}