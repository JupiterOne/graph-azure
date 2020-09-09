variable "azurerm_private_dns_zone" {
  type    = number
  default = 0
}

variable "azurerm_private_dns_a_record" {
  type    = number
  default = 0
}

resource "azurerm_private_dns_zone" "j1dev" {
  count               = var.azurerm_private_dns_zone == 1 ? (var.azurerm_private_dns_zone == 1 ? 1 : 0) : 0
  name                = "jupiterone-dev.com"
  resource_group_name = azurerm_resource_group.j1dev.name
}

resource "azurerm_private_dns_a_record" "j1dev" {
  count               = var.azurerm_private_dns_a_record == 1 ? (var.azurerm_private_dns_a_record == 1 ? 1 : 0) : 0
  name                = "j1dev"
  zone_name           = azurerm_private_dns_zone.j1dev[0].name
  resource_group_name = azurerm_resource_group.j1dev.name
  ttl                 = 300
  records             = ["10.0.0.1"]
}
