import "cross-fetch/polyfill";

import { Client } from "@microsoft/microsoft-graph-client";

export default async function fetchOrganization(client: Client) {
  const response = await client.api("/organization").get();
  return response.value[0];
}
