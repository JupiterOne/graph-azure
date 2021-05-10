resource "azurerm_policy_definition" "j1dev_policy_definition" {
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

// Since all resources generated from this terraform are created in the `East US` region, this policy assignment,
// which sets `allowedLocations = ["West US"]` causes resources to be out-of-compliance.
resource "azurerm_policy_assignment" "j1dev_policy_assignment" {
  name                 = "j1dev-policy-assignment"
  scope                = data.azurerm_subscription.j1dev.id
  policy_definition_id = azurerm_policy_definition.j1dev_policy_definition.id
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
    "value": [ "West US" ]
  }
}
PARAMETERS

}

// New policies may take up to 30 minutes to first evaluate. In order to evaluate right away, you can send 
// an authenticated POST request to 
// https://management.azure.com/subscriptions/{{subscription-id}}/providers/Microsoft.PolicyInsights/policyStates/latest/triggerEvaluation?api-version=2019-10-01