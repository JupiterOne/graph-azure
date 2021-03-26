# DIAGNOSTIC SETTINGS NOTE:
# When taking a recording of a request to Azure to retrieve diagnostic settings for an Azure resource, 
# the request sometimes returns a different amount of diagnostic settings for that resource than what was specified in the terraform.
#
# This occurs when specifying that Azure only create a subset of all potential diagnostic settings for a resource.
# E.G. In terraform, you specify that only one diagnostic settings log category is enabled, although there are more log categories that can be enabled for that resource.
#
# This is because when you make a request to create diagnostic settings for that resource, Azure automatically creates the other diagnostic settings categories with default values.
# The result will be that the response given from retrieving diagnostic settings for that resource return more diagnostic settings than the amount of diagnostic settings you specified in the terraform.
#
# The next time you run terraform, it will see that it plans to remove the 'extra' set of diagnostic settings (the ones Azure created by default), even though you never specified to create them.
# It will then attempt to remove the default diagnostic settings that Azure created.
#
# If another recording of the same request to Azure to retrieve diagnostic settings is taken, you will see that either:
# 1) Azure allows the deletion of the default diagnostic settings, resulting in inconsistent testing. You can't both assert that the default settings exist and don't exist.
# 2) Azure does not allow the deletion of the default diagnostic settings and recreates them or ignores the request. This might result in you not understanding why more results are returned than expected in your tests.
#
# It was suggested that the best way to handle this problem is to supply the full available set of diagnostic settings categories for a resource in terraform. 
# Doing this ensures that you get the same result when performing the terraform multiple times because Azure won't have the opportunity to create defaults.
# 
# See https://github.com/terraform-providers/terraform-provider-azurerm/issues/7235#issuecomment-647974840 for more details.

variable "create_azure_network_azure_firewall" {
  type    = number
  default = 0
}

locals {
  network_azure_firewall_count = var.create_azure_network_azure_firewall == 1 ? 1 : 0
}

#### VPC default, eastus

resource "azurerm_virtual_network" "j1dev" {
  name                = "j1dev"
  address_space       = ["10.0.0.0/16"]
  location            = "eastus"
  resource_group_name = azurerm_resource_group.j1dev.name

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_nv_ds_cat" {
  resource_id = azurerm_virtual_network.j1dev.id
}

resource "azurerm_subnet" "j1dev" {
  name                 = "j1dev"
  resource_group_name  = azurerm_resource_group.j1dev.name
  virtual_network_name = azurerm_virtual_network.j1dev.name
  address_prefix       = "10.0.2.0/24"
}

resource "azurerm_subnet" "j1dev_priv_one" {
  name                 = "j1dev_priv_one"
  resource_group_name  = azurerm_resource_group.j1dev.name
  virtual_network_name = azurerm_virtual_network.j1dev.name
  address_prefix       = "10.0.3.0/24"
}

resource "azurerm_subnet_network_security_group_association" "j1dev" {
  subnet_id                 = azurerm_subnet.j1dev.id
  network_security_group_id = azurerm_network_security_group.j1dev.id
}

resource "azurerm_public_ip" "j1dev" {
  name                = "j1dev"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.j1dev.name
  allocation_method   = "Dynamic"

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_pub_ip_ds_cat" {
  resource_id = azurerm_public_ip.j1dev.id
}

resource "azurerm_public_ip" "j1dev_lb_ip" {
  name                = "j1dev_lb_ip"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.j1dev.name
  allocation_method   = "Dynamic"

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_lb" "j1dev" {
  name                = "TestLoadBalancer"
  location            = "East US"
  resource_group_name = azurerm_resource_group.j1dev.name

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.j1dev_lb_ip.id
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_lb_ds_cat" {
  resource_id = azurerm_lb.j1dev.id
}

resource "azurerm_network_security_group" "j1dev" {
  name                = "j1dev"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.j1dev.name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # This rule will match any private subnet matching the source address prefix,
  # including those in other virtual networks across regions.
  security_rule {
    name                       = "priv_one"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "10.0.3.0/24"
    destination_address_prefix = "*"
  }

  tags = {
    environment = local.j1env
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_net_sec_grp_ds_cat" {
  resource_id = azurerm_network_security_group.j1dev.id
}

resource "azurerm_monitor_diagnostic_setting" "j1dev_net_sec_grp_set" {
  name               = "j1dev_net_sec_grp_set"
  target_resource_id = azurerm_network_security_group.j1dev.id
  storage_account_id = azurerm_storage_account.j1dev.id

  dynamic log {
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_net_sec_grp_ds_cat.logs)
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
    for_each = sort(data.azurerm_monitor_diagnostic_categories.j1dev_net_sec_grp_ds_cat.metrics)
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

resource "azurerm_network_interface" "j1dev" {
  name                = "j1dev"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.j1dev.name

  ip_configuration {
    name                          = "j1devConfiguration"
    subnet_id                     = azurerm_subnet.j1dev.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.j1dev.id
  }

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_network_interface_security_group_association" "j1dev" {
  network_interface_id      = azurerm_network_interface.j1dev.id
  network_security_group_id = azurerm_network_security_group.j1dev.id
}

resource "azurerm_linux_virtual_machine" "j1dev" {
  count = var.azurerm_compute_virtual_machines

  name                  = "j1dev"
  location              = "eastus"
  resource_group_name   = azurerm_resource_group.j1dev.name
  network_interface_ids = [azurerm_network_interface.j1dev.id]
  size                  = "Standard_DS1_v2"

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "16.04.0-LTS"
    version   = "latest"
  }

  computer_name                   = "myvm"
  admin_username                  = "azureuser"
  disable_password_authentication = true

  admin_ssh_key {
    username   = "azureuser"
    public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCXZM0BFwNpwIM4thhnI8ZqgVSuyrm6TUKGD+8CQ+rIDhP6qZ/MH+lPSBAW8HAcufQGE/icreNFTgjcBxdllXOoETT7SNgKBNc9xoHvr94FXhBZIh/guws1MwyhNwbuWWdx9xB9b1hNGkh7T++DjCTyydjtG1C/24DXf6gm/bc8UbSuWlECQhNWor0ASYBRVajzvGqjbub42eSj+hgthoxZaX5iAXDHvQVbVIYmwPxxsnrC+ORN8WNpqXCuVvoBAIXbXT+1zLDk1E9ByGZ/jctnPGpKFreu2gV80kKRpAdKO5k2Z/0ylrwb3iV6fq+Edbv5CO2dcj8R/W2ZSlQSkku/nDis1Mo4KB1jTMlWEujzIp437SO3bcT2BeyxBbEOhyKNcPok++2cizL6wX2BVyK1qCKSvSlRQ6JNIHYRjAfnUChHac6xeuWVSWLazQIcPjyUAFS/amhtfBfzHFBDdSaY0VXEOLye2wZW7kejMSQp5heM3VtLytX2vgBPvPPsCwwPS8iSW3IY5cnYaviRp2oVqxkft/vTYT6SBu4YaDa1NfZjFGXnbZTUkWoarugWV2W/6OfEQv2RtjfetXf+/8hpDsrtJfTKw/z7dvhpR42UExYB4ks10Fqm0FORUbnI/Zh0HvsorHhoMo5FTZIOOBQkwB2Wgs93EcGrNYqYY6sEjw=="
  }

  tags = {
    environment = local.j1env
  }
}

#### VPC default, westus

# Another private network, having the same address_space as that in eastus, for
# the purpose of proving various compute/network ingest processes.

resource "azurerm_virtual_network" "j1dev_two" {
  name                = "j1dev_two"
  address_space       = ["10.0.0.0/16"]
  location            = "westus"
  resource_group_name = azurerm_resource_group.j1dev.name

  tags = {
    environment = local.j1env
  }
}

resource "azurerm_subnet" "j1dev_priv_two" {
  name                 = "j1dev_priv_two"
  resource_group_name  = azurerm_resource_group.j1dev.name
  virtual_network_name = azurerm_virtual_network.j1dev_two.name
  address_prefix       = "10.0.3.0/24"
}

resource "azurerm_virtual_network" "j1dev_az_fw_vm" {
  count               = local.network_azure_firewall_count
  name                = "j1dev_az_fw_vm"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
}

resource "azurerm_subnet" "j1dev_az_fw_subnet" {
  count                = local.network_azure_firewall_count
  name                 = "AzureFirewallSubnet"
  resource_group_name  = azurerm_resource_group.j1dev.name
  virtual_network_name = azurerm_virtual_network.j1dev_az_fw_vm[0].name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "j1dev_az_fw_pub_ip" {
  count               = local.network_azure_firewall_count
  name                = "j1dev_az_fw_pub_ip"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_firewall" "j1dev_firewall" {
  count               = local.network_azure_firewall_count
  name                = "j1dev_firewall"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name

  ip_configuration {
    name                 = "configuration"
    subnet_id            = azurerm_subnet.j1dev_az_fw_subnet[0].id
    public_ip_address_id = azurerm_public_ip.j1dev_az_fw_pub_ip[0].id
  }
}

data "azurerm_monitor_diagnostic_categories" "j1dev_firewall_ds_cat" {
  count       = local.network_azure_firewall_count
  resource_id = azurerm_firewall.j1dev_firewall[0].id
}
