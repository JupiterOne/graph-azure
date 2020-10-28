variable "create_policy_assignment" {
  type    = number
  default = 0
}

locals {
  policy_assignment_count = var.create_policy_assignment == 1 ? 1 : 0
}

resource "azurerm_policy_definition" "j1dev-policy-definition" {
  count        = local.policy_assignment_count
  name         = "j1dev-policy-definition"
  policy_type  = "Custom"
  mode         = "All"
  display_name = "j1dev-policy-definition"

  policy_rule = <<POLICY_RULE
    {
    "if": {
      "not": {
        "field": "location",
        "in": "[parameters('allowedLocations')]"
      }
    },
    "then": {
      "effect": "audit"
    }
  }
POLICY_RULE


  parameters = <<PARAMETERS
    {
    "allowedLocations": {
      "type": "Array",
      "metadata": {
        "description": "The list of allowed locations for resources.",
        "displayName": "Allowed locations",
        "strongType": "location"
      }
    }
  }
PARAMETERS

}

resource "azurerm_resource_group" "j1dev-policy-resource-group" {
  count    = local.policy_assignment_count
  name     = "j1dev-policy-resource-group"
  location = "East US"
}

resource "azurerm_policy_assignment" "j1dev-policy-assignment" {
  count                = local.policy_assignment_count
  name                 = "j1dev-policy-assignment"
  scope                = azurerm_resource_group.j1dev-policy-resource-group[0].id
  policy_definition_id = azurerm_policy_definition.j1dev-policy-definition[0].id
  description          = "j1dev Policy Assignment created via Test"
  display_name         = "My Example Policy Assignment"

  metadata = <<METADATA
    {
    "category": "General"
    }
METADATA

  parameters = <<PARAMETERS
{
  "allowedLocations": {
    "value": [ "East US", "West US" ]
  }
}
PARAMETERS

}
