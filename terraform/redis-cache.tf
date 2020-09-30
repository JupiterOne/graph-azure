variable "create_redis_cache" {
  type    = number
  default = 0
}

locals {
  redis_cache_count = var.create_redis_cache == 1 ? 1 : 0
}


resource "azurerm_redis_cache" "j1ev" {
  count = local.redis_cache_count
  # NOTE: the Name used for Redis needs to be globally unique
  name                = "${var.developer_id}-j1dev-redis-cache"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  capacity            = 2
  family              = "C"
  sku_name            = "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}
