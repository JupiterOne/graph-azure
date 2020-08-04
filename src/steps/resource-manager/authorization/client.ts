import { AuthorizationManagementClient } from '@azure/arm-authorization';
import {
  RoleDefinition,
  RoleAssignment,
  ClassicAdministrator,
} from '@azure/arm-authorization/esm/models';
import { Client } from '../../../azure/resource-manager/client';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

export class AuthorizationClient extends Client {
  public async getRoleDefinition(
    fullyQualifiedRoleDefinitionId: string,
  ): Promise<RoleDefinition | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AuthorizationManagementClient,
    );

    try {
      const roleDefinition = await serviceClient.roleDefinitions.getById(
        fullyQualifiedRoleDefinitionId,
      );
      return roleDefinition;
    } catch (err) {
      /* istanbul ignore else */
      if (err.statusCode === 404) {
        this.logger.warn({ err }, 'Resource not found');
      } else {
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint: 'authorization.roleDefinition',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }

  public async iterateRoleAssignments(
    callback: (ra: RoleAssignment) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AuthorizationManagementClient,
    );
    try {
      const items = await serviceClient.roleAssignments.list();
      for (const item of items) {
        await callback(item);
      }
    } catch (err) {
      /* istanbul ignore else */
      if (err.statusCode === 404) {
        this.logger.warn({ err }, 'Resources not found');
      } else {
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint: 'authorization.roleAssignments',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }

  public async iterateClassicAdministrators(
    callback: (ca: ClassicAdministrator) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      AuthorizationManagementClient,
    );
    try {
      const items = await serviceClient.classicAdministrators.list();
      for (const item of items) {
        await callback(item);
      }
    } catch (err) {
      /* istanbul ignore else */
      if (err.statusCode === 404) {
        this.logger.warn({ err }, 'Resources not found');
      } else {
        throw new IntegrationProviderAPIError({
          cause: err,
          endpoint: 'authorization.classicAdministrators',
          status: err.statusCode,
          statusText: err.statusText,
        });
      }
    }
  }
}
