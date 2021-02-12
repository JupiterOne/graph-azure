variable "create_event_grid_domain" {
  type    = number
  default = 0
}

variable "create_event_grid_subscription" {
  type    = number
  default = 0
}

variable "create_event_grid_topic" {
  type    = number
  default = 0
}

locals {
  event_grid_domain_count       = var.create_event_grid_domain == 1 ? 1 : 0
  event_grid_subscription_count = var.create_event_grid_subscription == 1 ? 1 : 0
  event_grid_topic_count        = var.create_event_grid_topic == 1 ? 1 : 0
}

resource "azurerm_eventgrid_domain" "j1dev" {
  count               = local.event_grid_domain_count
  name                = "j1dev-event-grid-domain"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_evt_grd_dom_cat" {
  count       = local.event_grid_domain_count
  resource_id = azurerm_eventgrid_domain.j1dev[0].id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_evt_grd_dom_dg_set" {
  count              = local.event_grid_domain_count
  name               = "j1dev_evt_grd_dom_dg_set"
  target_resource_id = azurerm_eventgrid_domain.j1dev[0].id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_evt_grd_dom_cat[0].logs)
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
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_evt_grd_dom_cat[0].metrics)
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

resource "azurerm_eventgrid_domain_topic" "j1dev" {
  count               = local.event_grid_domain_count
  name                = "j1dev-event-grid-domain-topic"
  domain_name         = azurerm_eventgrid_domain.j1dev[count.index].name
  resource_group_name = azurerm_resource_group.j1dev.name
}

resource "azurerm_storage_queue" "j1dev_domain_topic_subscription_storage" {
  name                 = "j1dev-domain-topic-subscription-storage"
  storage_account_name = azurerm_storage_account.j1dev.name
}

resource "azurerm_eventgrid_event_subscription" "j1dev_domain_topic_subscription" {
  count = local.event_grid_domain_count
  name  = "j1dev-event-grid-domain-topic-subscription"
  scope = azurerm_eventgrid_domain_topic.j1dev[count.index].id

  storage_queue_endpoint {
    storage_account_id = azurerm_storage_account.j1dev.id
    queue_name         = azurerm_storage_queue.j1dev_domain_topic_subscription_storage.name
  }
  depends_on = [azurerm_eventgrid_domain_topic.j1dev, azurerm_storage_queue.j1dev_domain_topic_subscription_storage]
}

resource "azurerm_eventgrid_topic" "j1dev" {
  count               = local.event_grid_topic_count
  name                = "j1dev-event-grid-topic"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_evt_grd_tp_cat" {
  count       = local.event_grid_topic_count
  resource_id = azurerm_eventgrid_topic.j1dev[0].id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_evt_grd_tp_dg_set" {
  count              = local.event_grid_topic_count
  name               = "j1dev_evt_grd_tp_dg_set"
  target_resource_id = azurerm_eventgrid_topic.j1dev[0].id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_evt_grd_tp_cat[0].logs)
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
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_evt_grd_tp_cat[0].metrics)
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

resource "azurerm_eventgrid_event_subscription" "j1dev" {
  count = local.event_grid_subscription_count
  name  = "j1dev-event-grid-event-subscription"
  scope = azurerm_eventgrid_topic.j1dev[count.index].id

  storage_queue_endpoint {
    storage_account_id = azurerm_storage_account.j1dev.id
    queue_name         = azurerm_storage_queue.j1dev.name
  }

  depends_on = [azurerm_eventgrid_topic.j1dev]
}
