provider "azurerm" {
  features {}
}

locals {
  j1env = "j1dev"
}

resource "azurerm_resource_group" "j1dev" {
  name     = "j1dev"
  location = "eastus"

  tags = {
    environment = "${local.j1env}"
  }
}