provider "azurerm" {
  version = "~>2.43.0"
  features {
    key_vault {
      recover_soft_deleted_key_vaults = true
      purge_soft_delete_on_destroy = true
    }
  }
}

locals {
  j1env = "j1dev"
}

resource "azurerm_resource_group" "j1dev" {
  name     = "j1dev"
  location = "eastus"

  tags = {
    environment = local.j1env
  }
}

data "azurerm_subscription" "j1dev" {
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_subscription" {
  name               = "j1dev"
  target_resource_id = data.azurerm_subscription.j1dev.id
  storage_account_id = azurerm_storage_account.j1dev.id

  log {
    category = "Administrative"
  }
  log {
    category = "Alert"
  }
  log {
    category = "Policy"
  }
  log {
    category = "Security"
  }
}