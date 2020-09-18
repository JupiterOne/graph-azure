variable "create_cdn_resources" {
  type    = number
  default = 0
}

locals {
  cdn_resource_count = var.create_cdn_resources == 1 ? 1 : 0
}

resource "azurerm_cdn_profile" "j1dev" {
  count               = local.cdn_resource_count
  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  location            = azurerm_resource_group.j1dev.location
  sku                 = "Standard_Microsoft"
}

resource "azurerm_cdn_endpoint" "j1dev" {
  count               = local.cdn_resource_count
  name                = "j1dev"
  profile_name        = azurerm_cdn_profile.j1dev[0].name
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  origin {
    name      = "j1dev"
    host_name = "www.jupiterone.com"
  }
  origin_host_header = "www.jupiterone.com"
}
