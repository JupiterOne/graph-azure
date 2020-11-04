variable "create_security_center_contact" {
  type    = number
  default = 0
}

locals {
  security_center_contact_count = var.create_security_center_contact == 1 ? 1 : 0
}

resource "azurerm_security_center_contact" "j1dev" {
  count               = local.security_center_contact_count
  email               = "test@j1dev.com"
  phone               = "+1-801-555-1234"
  alert_notifications = true
  alerts_to_admins    = true
}
