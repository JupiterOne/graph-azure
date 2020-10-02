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
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_reserved = 2
    maxmemory_delta    = 2
    maxmemory_policy   = "allkeys-lru"
  }

  depends_on = [azurerm_resource_group.j1dev]
}

resource "azurerm_redis_firewall_rule" "j1dev" {
  count = local.redis_cache_count
  # NOTE: You cannot choose a name with hyphens, only alphanumeric characters and underscores are allowed
  name                = "j1dev_redis_cache_firewall_rule"
  redis_cache_name    = azurerm_redis_cache.j1dev[count.index].name
  resource_group_name = azurerm_resource_group.j1dev.name
  start_ip            = "1.2.3.4"
  end_ip              = "2.3.4.5"
  depends_on          = [azurerm_resource_group.j1dev, azurerm_redis_cache.j1dev]
}

resource "azurerm_redis_cache" "j1dev-primary-redis-cache" {
  count = local.redis_cache_count
  # NOTE: the Name used for Redis needs to be globally unique
  # NOTE: You cannot choose a name with underscores, only alphanumeric characters and hyphens are allowed
  name                = "${var.developer_id}-j1dev-primary-redis-cache"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  capacity            = 2
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_reserved = 2
    maxmemory_delta    = 2
    maxmemory_policy   = "allkeys-lru"
  }

  depends_on = [azurerm_resource_group.j1dev]
}

resource "azurerm_resource_group" "j1dev-secondary-redis-cache-resource-group" {
  count    = local.redis_cache_count
  name     = "j1dev-secondary-redis-cache-resource-group"
  location = "West US"
}

resource "azurerm_redis_cache" "j1dev-secondary-redis-cache" {
  count               = local.redis_cache_count
  name                = "${var.developer_id}-j1dev-secondary-redis-cache"
  location            = azurerm_resource_group.j1dev-secondary-redis-cache-resource-group[count.index].location
  resource_group_name = azurerm_resource_group.j1dev-secondary-redis-cache-resource-group[count.index].name
  capacity            = 2
  family              = "P"
  sku_name            = "Premium"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_reserved = 2
    maxmemory_delta    = 2
    maxmemory_policy   = "allkeys-lru"
  }

  depends_on = [azurerm_resource_group.j1dev-secondary-redis-cache-resource-group]
}

resource "azurerm_redis_linked_server" "j1dev-redis-linked-server" {
  count                       = local.redis_cache_count
  target_redis_cache_name     = azurerm_redis_cache.j1dev-primary-redis-cache[count.index].name
  resource_group_name         = azurerm_redis_cache.j1dev-primary-redis-cache[count.index].resource_group_name
  linked_redis_cache_id       = azurerm_redis_cache.j1dev-secondary-redis-cache[count.index].id
  linked_redis_cache_location = azurerm_redis_cache.j1dev-secondary-redis-cache[count.index].location
  server_role                 = "Secondary"
  depends_on                  = [azurerm_redis_cache.j1dev-primary-redis-cache, azurerm_redis_cache.j1dev-secondary-redis-cache]
}
