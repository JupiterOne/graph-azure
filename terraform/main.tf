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
