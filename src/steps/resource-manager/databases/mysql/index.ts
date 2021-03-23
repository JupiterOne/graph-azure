import {
  createDirectRelationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../../azure';
import { IntegrationStepContext } from '../../../../types';
import { getAccountEntity } from '../../../active-directory';
import { createDatabaseEntity, createDbServerEntity } from '../converters';
import { MySQLClient } from './client';
import { MySQLEntities } from './constants';
import createResourceGroupResourceRelationship from '../../utils/createResourceGroupResourceRelationship';
import { createDiagnosticSettingsEntitiesAndRelationshipsForResource } from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';

export * from './constants';

export async function fetchMySQLDatabases(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MySQLClient(instance.config, logger);

  await client.iterateServers(async (server) => {
    const serverEntity = createDbServerEntity(
      webLinker,
      server,
      MySQLEntities.SERVER._type,
    );
    await jobState.addEntity(serverEntity);

    await createResourceGroupResourceRelationship(
      executionContext,
      serverEntity,
    );

    await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
      executionContext,
      serverEntity,
    );

    try {
      await client.iterateDatabases(server, async (e) => {
        const databaseEntity = createDatabaseEntity(
          webLinker,
          e,
          MySQLEntities.DATABASE._type,
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
