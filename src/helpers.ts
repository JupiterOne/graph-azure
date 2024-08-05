import { createIntegrationHelpers } from '@jupiterone/integration-sdk-core';
import { typeboxClassSchemaMap } from '@jupiterone/data-model';

export const { createEntityType, createEntityMetadata } =
  createIntegrationHelpers({
    integrationName: 'azure',
    classSchemaMap: typeboxClassSchemaMap,
  });
