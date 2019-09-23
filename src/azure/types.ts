import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

export enum MemberType {
  USER = "#microsoft.graph.user",
  GROUP = "#microsoft.graph.group",
}

export interface Group extends MicrosoftGraph.Group {
  id: string;
}

export interface User extends MicrosoftGraph.User {
  id: string;
}

/**
 * The data answered by a request for group members. The properties are those
 * requested. Additional properties need to be added here and in
 * `fetchBatchOfGroupMembers`.
 */
export interface GroupMember extends MicrosoftGraph.DirectoryObject {
  "@odata.type": string;
  id: string;
  displayName?: string;
  mail?: string | null;
  jobTitle?: string | null;
}

/**
 * Builds web links to Azure things.
 *
 * This allows for providing an object that has dynamic information about the
 * base url of resources. It is provided by synchronizers to entity/relationship
 * converters to avoid having converters guess too much.
 */
export interface AzureWebLinker {
  /**
   * Builds a link to a resource in the Azure Portal, such as:
   * `"https://portal.azure.com/#@adamjupiteronehotmailcom.onmicrosoft.com/resource/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev"`
   *
   * @param path resource path, i.e.
   * `"/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Compute/virtualMachines/j1dev"`;
   * `undefined` simplifies the API for callers which typically are processing
   * API data which may have undefined properties
   * @returns the portal url or `undefined` when it cannot be accurately
   * determined
   */
  portalResourceUrl: (path: string | undefined) => string | undefined;
}
