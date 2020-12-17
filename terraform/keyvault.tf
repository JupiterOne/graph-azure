data "azurerm_client_config" "current" {}
resource "azurerm_key_vault" "j1dev" {
  name                        = "${var.developer_id}1-j1dev"
  location                    = azurerm_resource_group.j1dev.location
  resource_group_name         = azurerm_resource_group.j1dev.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled         = true
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_key_vault_access_policy" "j1dev" {
  key_vault_id = azurerm_key_vault.j1dev.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id

  key_permissions = [
    "get",
  ]

  secret_permissions = [
    "get",
  ]
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_key_vault_diag_set" {
  name               = "j1dev_key_vault_diag_set"
  target_resource_id = azurerm_key_vault.j1dev.id
  storage_account_id = azurerm_storage_account.j1dev.id

  log {
    category = "AuditEvent"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 7
    }
  }

  log {
    category = "AuditEvent"
    enabled  = true

    retention_policy {
      enabled = false
      days    = 7
    }
  }

  metric {
    category = "AllMetrics"

    retention_policy {
      enabled = false
    }
  }
}