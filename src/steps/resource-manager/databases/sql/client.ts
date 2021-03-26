import { SqlManagementClient } from '@azure/arm-sql';
import {
  Database,
  DatabaseBlobAuditingPoliciesGetResponse,
  EncryptionProtectorsGetResponse,
  FirewallRule,
  Server,
  ServerAzureADAdministrator,
  ServerBlobAuditingPoliciesGetResponse,
  ServerSecurityAlertPoliciesGetResponse,
  TransparentDataEncryptionsGetResponse,
} from '@azure/arm-sql/esm/models';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

import {
  Client,
  iterateAllResources,
} from '../../../../azure/resource-manager/client';
import { resourceGroupName } from '../../../../azure/utils';

export class SQLClient extends Client {
  public async iterateServers(
    callback: (
      s: Server,
      serviceClient: SqlManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.servers,
      resourceDescription: 'sql.servers',
      callback,
    });
  }

  public async iterateDatabases(
    server: Server,
    callback: (
      d: Database,
      serviceClient: SqlManagementClient,
    ) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.databases.listByServer(
            resourceGroup,
            serverName,
          );
        },
      },
      resourceDescription: 'sql.databases',
      callback,
    });
  }

  public async iterateServerActiveDirectoryAdministrators(
    server: { name: string; id: string },
    callback: (admin: ServerAzureADAdministrator) => void | Promise<void>,
  ) {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.serverAzureADAdministrators.listByServer(
            resourceGroup,
            serverName,
          );
        },
      },
      resourceDescription: 'sql.server.activeDirectoryAdmins',
      callback,
    });
  }

  public async fetchServerEncryptionProtector(server: {
    name: string;
    id: string;
  }): Promise<EncryptionProtectorsGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name;

    try {
      const response = await serviceClient.encryptionProtectors.get(
        resourceGroup,
        serverName,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'sql.encryptionProtectors',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
        },
        'Failed to obtain encryption protectors for server',
      );
    }
  }

  public async fetchDatabaseEncryption(
    server: Server,
    database: Database,
  ): Promise<TransparentDataEncryptionsGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    try {
      return await serviceClient.transparentDataEncryptions.get(
        resourceGroupName(server.id, true),
        server.name as string,
        database.name as string,
      );
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'sql.transparentDataEncryptions',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
          database: database.id,
        },
        'Failed to obtain encryptions for database',
      );
    }
  }

  public async fetchServerAuditingStatus(
    server: Server,
  ): Promise<ServerBlobAuditingPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    try {
      return await serviceClient.serverBlobAuditingPolicies.get(
        resourceGroupName(server.id, true),
        server.name as string,
      );
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'sql.serverBlobAuditingPolicies',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
        },
        'Failed to obtain auditing for server',
      );
    }
  }

  public async fetchDatabaseAuditingStatus(
    server: Server,
    database: Database,
  ): Promise<DatabaseBlobAuditingPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    try {
      return await serviceClient.databaseBlobAuditingPolicies.get(
        resourceGroupName(server.id, true),
        server.name as string,
        database.name as string,
      );
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'sql.databaseBlobAuditingPolicies',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
          database: database.id,
        },
        'Failed to obtain auditing policies for database',
      );
    }
  }

  public async fetchServerSecurityAlertPolicies(
    server: Server,
  ): Promise<ServerSecurityAlertPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    try {
      return await serviceClient.serverSecurityAlertPolicies.get(
        resourceGroupName(server.id, true),
        server.name as string,
      );
    } catch (err) {
      this.logger.warn(
        {
          err: new IntegrationProviderAPIError({
            endpoint: 'sql.serverSecurityAlertPolicies',
            status: err.status,
            statusText: err.statusText,
            cause: err,
          }),
          server: server.id,
        },
        'Failed to obtain security alert policies for server',
      );
    }
  }

  public async iterateServerFirewallRules(
    server: {
      id?: string;
      name?: string;
    },
    callback: (r: FirewallRule) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    const resourceGroup = resourceGroupName(server.id, true);
    const serverName = server.name as string;

    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: {
        list: async () => {
          return serviceClient.firewallRules.listByServer(
            resourceGroup,
            serverName,
          );
        },
      },
      resourceDescription: 'sql.firewallRules',
      callback,
    });
  }
}
