variable "create_container_group" {
  type    = number
  default = 0
}

locals {
  container_group_count = var.create_container_group == 1 ? 1 : 0
}

# https://www.terraform.io/docs/providers/azurerm/r/container_group.html
resource "azurerm_container_group" "j1dev" {
  count               = local.container_group_count
  name                = "j1dev-container-group"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  # public or private
  ip_address_type = "public"
  dns_name_label  = "j1dev-container-group-dns-${var.developer_id}"
  # Linux or Windows
  os_type = "Linux"

  container {
    name   = "nginx"
    image  = "nginx"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 80
      protocol = "TCP"
    }

    volume {
      name                 = "nginx-mount"
      mount_path           = "/etc/test_mount"
      storage_account_name = azurerm_storage_account.j1dev.name
      storage_account_key  = azurerm_storage_account.j1dev.primary_access_key
      share_name           = azurerm_storage_share.j1dev.name
    }
  }

  container {
    name   = "hello-world"
    image  = "microsoft/aci-helloworld:latest"
    cpu    = "0.5"
    memory = "1.5"

    ports {
      port     = 443
      protocol = "TCP"
    }
  }
}
