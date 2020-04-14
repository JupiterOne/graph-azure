resource "azurerm_cosmosdb_account" "j1dev" {
  name                = "j1dev"
  location            = azurerm_resource_group.j1dev.location
  resource_group_name = azurerm_resource_group.j1dev.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  enable_automatic_failover = false

  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 10
    max_staleness_prefix    = 200
  }

  geo_location {
    location          = azurerm_resource_group.j1dev.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "j1dev" {
  count = azurerm_cosmosdb_sql_databases

  name                = "j1dev"
  resource_group_name = azurerm_resource_group.j1dev.name
  account_name        = azurerm_cosmosdb_account.j1dev.name
  throughput          = 400
}
