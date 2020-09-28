provider "azurerm" {
  version = "~>2.29.0"
  features {}
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
