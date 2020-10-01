variable "create_redis_cache" {
  type    = number
  default = 0
}

locals {
  redis_cache_count = var.create_redis_cache == 1 ? 1 : 0
}


resource "azurerm_redis_cache" "j1dev" {
  count = local.redis_cache_count
  # NOTE: the Name used for Redis needs to be globally unique
  # NOTE: You cannot choose a name with underscores, only alphanumeric characters and hyphens are allowed
  name                = "${var.developer_id}-j1dev-redis-cache"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  capacity            = 2
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}

resource "azurerm_redis_firewall_rule" "j1dev" {
  count = local.redis_cache_count
  # NOTE: You cannot choose a name with hyphens, only alphanumeric characters and underscores are allowed
  name                = "j1dev_redis_cache_firewall_rule"
  redis_cache_name    = azurerm_redis_cache.j1dev[count.index].name
  resource_group_name = azurerm_resource_group.j1dev.name
  start_ip            = "1.2.3.4"
  end_ip              = "2.3.4.5"
}
