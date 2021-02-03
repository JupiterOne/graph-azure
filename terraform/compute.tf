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

resource "azurerm_monitor_diagnostic_setting" "j1dev_pub_ip_diag_set" {
  name               = "j1dev_pub_ip_diag_set"
  target_resource_id = azurerm_public_ip.j1dev.id
  storage_account_id = azurerm_storage_account.j1dev.id

  log {
    category = "DDoSMitigationFlowLogs"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 1
    }
  }
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

resource "azurerm_monitor_diagnostic_setting" "j1dev_net_sec_grp_set" {
  name               = "j1dev_net_sec_grp_set"
  target_resource_id = azurerm_network_security_group.j1dev.id
  storage_account_id = azurerm_storage_account.j1dev.id

  log {
    category = "NetworkSecurityGroupRuleCounter"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 1
    }
  }

  log {
    category = "NetworkSecurityGroupEvent"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 1
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