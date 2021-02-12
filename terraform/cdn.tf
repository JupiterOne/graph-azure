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

data "azurerm_monitor_diagnostic_categories" "j1dev_cdn_prof_cat" {
  count       = local.cdn_resource_count
  resource_id = azurerm_cdn_profile.j1dev[0].id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_cdn_prof_diag_set" {
  count              = local.cdn_resource_count
  name               = "j1dev_cdn_prof_diag_set"
  target_resource_id = azurerm_cdn_profile.j1dev[0].id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_cdn_prof_cat[0].logs)
    content {
      category = log.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }

  dynamic metric {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_cdn_prof_cat[0].metrics)
    content {
      category = metric.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }
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

data "azurerm_monitor_diagnostic_categories" "j1dev_cdn_endpt_cat" {
  count       = local.cdn_resource_count
  resource_id = azurerm_cdn_endpoint.j1dev[0].id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_cdn_endpt_diag_set" {
  count              = local.cdn_resource_count
  name               = "j1dev_cdn_endpt_diag_set"
  target_resource_id = azurerm_cdn_endpoint.j1dev[0].id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_cdn_endpt_cat[0].logs)
    content {
      category = log.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }

  dynamic metric {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_cdn_endpt_cat[0].metrics)
    content {
      category = metric.value
      enabled  = true

      retention_policy {
        enabled = true
        days    = 1
      }
    }
  }
}
