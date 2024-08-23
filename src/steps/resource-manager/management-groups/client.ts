import {
  ManagementGroup,
  ManagementGroupsAPI,
} from '@azure/arm-managementgroups';
import { Client } from '../../../azure/resource-manager/client';

export class ManagementGroupClient extends Client {
  public async getManagementGroup(
    managementGroupId: string,
  ): Promise<ManagementGroup> {
    const client = this.getServiceClient(ManagementGroupsAPI);

    const managementGroups = client.managementGroups;

    return managementGroups.get(managementGroupId, {
      expand: 'children',
    });
  }
}
