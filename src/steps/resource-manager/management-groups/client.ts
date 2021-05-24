import {
  ManagementGroups,
  ManagementGroupsAPIContext,
} from '@azure/arm-managementgroups';
import { ManagementGroup } from '@azure/arm-managementgroups/esm/models';
import { Client } from '../../../azure/resource-manager/client';

export class ManagementGroupClient extends Client {
  public async getManagementGroup(
    managementGroupId: string,
  ): Promise<ManagementGroup> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      ManagementGroupsAPIContext,
      {
        passSubscriptionId: false,
      },
    );

    const managementGroups = new ManagementGroups(serviceClient);

    return managementGroups.get(managementGroupId, {
      expand: 'children',
    });
  }
}
