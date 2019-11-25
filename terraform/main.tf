provider "azurerm" {
}

locals {
  j1env = "j1dev"
}


resource "azurerm_resource_group" "j1dev" {
  name     = "j1dev"
  location = "eastus"

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_virtual_network" "j1dev" {
  name                = "j1dev"
  address_space       = ["10.0.0.0/16"]
  location            = "eastus"
  resource_group_name = "${azurerm_resource_group.j1dev.name}"

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_subnet" "j1dev" {
  name                      = "j1dev"
  resource_group_name       = "${azurerm_resource_group.j1dev.name}"
  virtual_network_name      = "${azurerm_virtual_network.j1dev.name}"
  address_prefix            = "10.0.2.0/24"
  network_security_group_id = "${azurerm_network_security_group.j1dev.id}"
}

resource "azurerm_subnet_network_security_group_association" "j1dev" {
  subnet_id                 = "${azurerm_subnet.j1dev.id}"
  network_security_group_id = "${azurerm_network_security_group.j1dev.id}"
}

resource "azurerm_public_ip" "j1dev" {
  name                         = "j1dev"
  location                     = "eastus"
  resource_group_name          = "${azurerm_resource_group.j1dev.name}"
  allocation_method            = "Dynamic"

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_network_security_group" "j1dev" {
  name                = "j1dev"
  location            = "eastus"
  resource_group_name = "${azurerm_resource_group.j1dev.name}"

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

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_network_interface" "j1dev" {
  name                = "j1dev"
  location            = "eastus"
  resource_group_name = "${azurerm_resource_group.j1dev.name}"
  network_security_group_id = "${azurerm_network_security_group.j1dev.id}"

  ip_configuration {
    name                          = "j1devConfiguration"
    subnet_id                     = "${azurerm_subnet.j1dev.id}"
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = "${azurerm_public_ip.j1dev.id}"
  }

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_storage_account" "j1dev" {
  name                = "j1dev"
  resource_group_name = "${azurerm_resource_group.j1dev.name}"
  location            = "eastus"
  account_replication_type = "LRS"
  account_tier = "Standard"

  tags = {
    environment = "${local.j1env}"
  }
}

resource "azurerm_storage_container" "j1dev" {
  name = "j1dev"
  storage_account_name = "${azurerm_storage_account.j1dev.name}"
}

resource "azurerm_virtual_machine" "j1dev" {
  name                  = "j1dev"
  location              = "eastus"
  resource_group_name   = "${azurerm_resource_group.j1dev.name}"
  network_interface_ids = ["${azurerm_network_interface.j1dev.id}"]
  vm_size               = "Standard_DS1_v2"

  storage_os_disk {
    name              = "j1devOsDisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Premium_LRS"
  }

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "16.04.0-LTS"
    version   = "latest"
  }

  os_profile {
    computer_name  = "myvm"
    admin_username = "azureuser"
  }

  os_profile_linux_config {
    disable_password_authentication = true
    ssh_keys {
      path     = "/home/azureuser/.ssh/authorized_keys"
      key_data = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCXZM0BFwNpwIM4thhnI8ZqgVSuyrm6TUKGD+8CQ+rIDhP6qZ/MH+lPSBAW8HAcufQGE/icreNFTgjcBxdllXOoETT7SNgKBNc9xoHvr94FXhBZIh/guws1MwyhNwbuWWdx9xB9b1hNGkh7T++DjCTyydjtG1C/24DXf6gm/bc8UbSuWlECQhNWor0ASYBRVajzvGqjbub42eSj+hgthoxZaX5iAXDHvQVbVIYmwPxxsnrC+ORN8WNpqXCuVvoBAIXbXT+1zLDk1E9ByGZ/jctnPGpKFreu2gV80kKRpAdKO5k2Z/0ylrwb3iV6fq+Edbv5CO2dcj8R/W2ZSlQSkku/nDis1Mo4KB1jTMlWEujzIp437SO3bcT2BeyxBbEOhyKNcPok++2cizL6wX2BVyK1qCKSvSlRQ6JNIHYRjAfnUChHac6xeuWVSWLazQIcPjyUAFS/amhtfBfzHFBDdSaY0VXEOLye2wZW7kejMSQp5heM3VtLytX2vgBPvPPsCwwPS8iSW3IY5cnYaviRp2oVqxkft/vTYT6SBu4YaDa1NfZjFGXnbZTUkWoarugWV2W/6OfEQv2RtjfetXf+/8hpDsrtJfTKw/z7dvhpR42UExYB4ks10Fqm0FORUbnI/Zh0HvsorHhoMo5FTZIOOBQkwB2Wgs93EcGrNYqYY6sEjw=="
    }
  }

  boot_diagnostics {
    enabled     = "true"
    storage_uri = "${azurerm_storage_account.j1dev.primary_blob_endpoint}"
  }

  tags = {
    environment = "${local.j1env}"
  }
}