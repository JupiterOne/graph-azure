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
