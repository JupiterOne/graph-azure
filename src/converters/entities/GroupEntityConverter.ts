import {
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  GroupEntity,
} from "../../jupiterone";

import { Group } from "../../azure/types";

import { generateEntityKey } from "../../utils/generateKeys";

export function createGroupEntities(data: Group[]): GroupEntity[] {
  return data.map(d => {
    const group: GroupEntity = {
      _class: GROUP_ENTITY_CLASS,
      _key: generateEntityKey(GROUP_ENTITY_TYPE, d.id),
      _type: GROUP_ENTITY_TYPE,
      displayName: d.displayName || "",
      id: d.id,
      deletedDateTime: d.deletedDateTime,
      classification: d.classification,
      createdDateTime: d.createdDateTime,
      description: d.description,
      mail: d.mail,
      mailEnabled: d.mailEnabled,
      mailNickname: d.mailNickname,
      renewedDateTime: d.renewedDateTime,
      securityEnabled: d.securityEnabled,
    };
    return group;
  });
}
