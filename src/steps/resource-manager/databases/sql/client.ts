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
  ServerVulnerabilityAssessmentsGetResponse,
  TransparentDataEncryptionsGetResponse,
} from '@azure/arm-sql/esm/models';
import {
  Client,
  iterateAllResources,
  request,
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
    const response = await request(
      async () =>
        await serviceClient.encryptionProtectors.get(resourceGroup, serverName),
      this.logger,
      'encryptionProtectors',
      60 * 1000,
    );
    return response;
  }

  public async fetchDatabaseEncryption(
    server: Server,
    database: Database,
  ): Promise<TransparentDataEncryptionsGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );

    const response = await request(
      async () =>
        await serviceClient.transparentDataEncryptions.get(
          resourceGroupName(server.id, true),
          server.name as string,
          database.name as string,
        ),
      this.logger,
      'transparentDataEncryptions',
      60 * 1000,
    );
    return response;
  }

  public async fetchServerAuditingStatus(
    server: Server,
  ): Promise<ServerBlobAuditingPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const response = await request(
      async () =>
        await serviceClient.serverBlobAuditingPolicies.get(
          resourceGroupName(server.id, true),
          server.name as string,
        ),
      this.logger,
      'serverBlobAuditingPolicies',
      60 * 1000,
    );
    return response;
  }

  public async fetchDatabaseAuditingStatus(
    server: Server,
    database: Database,
  ): Promise<DatabaseBlobAuditingPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const response = await request(
      async () =>
        await serviceClient.databaseBlobAuditingPolicies.get(
          resourceGroupName(server.id, true),
          server.name as string,
          database.name as string,
        ),
      this.logger,
      'databaseBlobAuditingPolicies',
      60 * 1000,
    );
    return response;
  }

  public async fetchServerVulnerabilityAssessment(
    server: Server,
  ): Promise<ServerVulnerabilityAssessmentsGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const response = await request(
      async () =>
        await serviceClient.serverVulnerabilityAssessments.get(
          resourceGroupName(server.id, true),
          server.name as string,
        ),
      this.logger,
      'serverVulnerabilityAssessments',
      60 * 1000,
    );
    return response;
  }

  public async fetchServerSecurityAlertPolicies(
    server: Server,
  ): Promise<ServerSecurityAlertPoliciesGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    const response = await request(
      async () =>
        await serviceClient.serverSecurityAlertPolicies.get(
          resourceGroupName(server.id, true),
          server.name as string,
        ),
      this.logger,
      'serverSecurityAlertPolicies',
      60 * 1000,
    );
    return response;
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
