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
  FIVE_MINUTES,
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
        list: () => {
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
        list: () => {
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
      const response = await request(
        async () =>
          await serviceClient.encryptionProtectors.get(
            resourceGroup,
            serverName,
          ),
        this.logger,
        'sql.encryptionProtectors',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
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
      const response = await request(
        async () =>
          await serviceClient.transparentDataEncryptions.get(
            resourceGroupName(server.id, true),
            server.name as string,
            database.name as string,
          ),
        this.logger,
        'sql.transparentDataEncryptions',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          err: err.message,
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
      const response = await request(
        async () =>
          await serviceClient.serverBlobAuditingPolicies.get(
            resourceGroupName(server.id, true),
            server.name as string,
          ),
        this.logger,
        'sql.serverBlobAuditingPolicies',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
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
      const response = await request(
        async () =>
          await serviceClient.databaseBlobAuditingPolicies.get(
            resourceGroupName(server.id, true),
            server.name as string,
            database.name as string,
          ),
        this.logger,
        'sql.databaseBlobAuditingPolicies',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
          server: server.id,
          database: database.id,
        },
        'Failed to obtain auditing policies for database',
      );
    }
  }

  public async fetchServerVulnerabilityAssessment(
    server: Server,
  ): Promise<ServerVulnerabilityAssessmentsGetResponse | undefined> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      SqlManagementClient,
    );
    try {
      const response = await request(
        async () =>
          await serviceClient.serverVulnerabilityAssessments.get(
            resourceGroupName(server.id, true),
            server.name as string,
          ),
        this.logger,
        'sql.serverVulnerabilityAssessments',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
          server: server.id,
        },
        'Failed to obtain vulnerability assessments for server',
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
      const response = await request(
        async () =>
          await serviceClient.serverSecurityAlertPolicies.get(
            resourceGroupName(server.id, true),
            server.name as string,
          ),
        this.logger,
        'sql.serverSecurityAlertPolicies',
        FIVE_MINUTES,
      );
      return response;
    } catch (err) {
      this.logger.warn(
        {
          error: err.message,
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
        list: () => {
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
