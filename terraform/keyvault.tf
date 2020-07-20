data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "j1dev" {
  name                        = "${var.developer_id}-j1dev"
  location                    = azurerm_resource_group.j1dev.location
  resource_group_name         = azurerm_resource_group.j1dev.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled         = false
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
