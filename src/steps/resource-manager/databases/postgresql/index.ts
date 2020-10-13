import {
  createDirectRelationship,
  Entity,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import { IntegrationStepContext } from '../../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../../active-directory';
import { createDatabaseEntity, createDbServerEntity } from '../converters';
import { PostgreSQLClient } from './client';
import {
  RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
  RM_POSTGRESQL_SERVER_ENTITY_TYPE,
} from './constants';
import createResourceGroupResourceRelationship from '../../utils/createResourceGroupResourceRelationship';

export * from './constants';

export async function fetchPostgreSQLDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new PostgreSQLClient(instance.config, logger);

  await client.iterateServers(async (server) => {
    const serverEntity = createDbServerEntity(
      webLinker,
      server,
      RM_POSTGRESQL_SERVER_ENTITY_TYPE,
    );
    await jobState.addEntity(serverEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      serverEntity,
    );

    try {
      await client.iterateDatabases(server, async (database) => {
        const databaseEntity = createDatabaseEntity(
          webLinker,
          database,
          RM_POSTGRESQL_DATABASE_ENTITY_TYPE,
        );

        await jobState.addEntity(databaseEntity);
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: serverEntity,
            to: databaseEntity,
          }),
        );
      });
    } catch (err) {
      logger.warn(
        { err, server: { id: server.id, type: server.type } },
        'Failure fetching databases for server',
      );
      // In the case this is a transient failure, ideally we would avoid
      // deleting previously ingested databases for this server. That would
      // require that we process each server independently, and have a way
      // to communicate to the synchronizer that only a subset is partial.
    }
  });
}
