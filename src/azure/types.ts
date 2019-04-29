import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";

export enum MemberType {
  USER = "#microsoft.graph.user",
  GROUP = "#microsoft.graph.group",
}

export interface Group extends MicrosoftGraph.Group {
  id: string;
  classification: any;
}

export interface User extends MicrosoftGraph.User {
  id: string;
}

export interface GroupMember {
  id: string;
  "@odata.type": string;
  [key: string]: any;
}

export interface GroupMembers {
  group: Group;
  members: GroupMember[];
}

export interface AzureDataModel {
  groups: Group[];
  users: User[];
  groupsMembers: GroupMembers[];
}
