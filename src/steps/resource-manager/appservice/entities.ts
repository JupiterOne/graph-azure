import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// App Service Entities
export const [WebAppEntityMetadata, createWebAppAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Web App',
    _class: ['Application'],
    _type: createEntityType('web_app'),
    description: 'Azure Web App',
    schema: SchemaType.Object({
      type: SchemaType.Optional(SchemaType.String()),
      kind: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      location: SchemaType.Optional(SchemaType.String()),
      authEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isAuthEnabled` instead',
        }),
      ),
      isAuthEnabled: SchemaType.Optional(SchemaType.Boolean()),
      httpsOnly: SchemaType.Optional(SchemaType.Boolean()),
      minTlsVersion: SchemaType.Optional(
        SchemaType.String([
          SchemaType.Literal('1.0'),
          SchemaType.Literal('1.1'),
          SchemaType.Literal('1.2'),
        ]),
      ),
      clientCertEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isClientCertEnabled` instead',
        }),
      ),
      isClientCertEnabled: SchemaType.Optional(SchemaType.Boolean()),
      principalId: SchemaType.Optional(SchemaType.String()),
      phpVersion: SchemaType.Optional(SchemaType.String()),
      pythonVersion: SchemaType.Optional(SchemaType.String()),
      javaVersion: SchemaType.Optional(
        SchemaType.Union([SchemaType.String(), SchemaType.Null()]),
      ),
      nodeVersion: SchemaType.Optional(SchemaType.String()),
      http20Enabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isHttp20Enabled` instead',
        }),
      ),
      isHttp20Enabled: SchemaType.Optional(SchemaType.Boolean()),
      ftpsState: SchemaType.Optional(
        SchemaType.String([
          SchemaType.Literal('AllAllowed'),
          SchemaType.Literal('FtpsOnly'),
          SchemaType.Literal('Disabled'),
        ]),
      ),
    }),
  });

export const [FunctionAppEntityMetadata, createFunctionAppAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Function App',
    _class: ['Function'],
    _type: createEntityType('function_app'),
    description: 'Azure Function App',
    schema: SchemaType.Object({
      type: SchemaType.Optional(SchemaType.String()),
      kind: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      location: SchemaType.Optional(SchemaType.String()),
      authEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isAuthEnabled` instead',
        }),
      ),
      isAuthEnabled: SchemaType.Optional(SchemaType.Boolean()),
      httpsOnly: SchemaType.Optional(SchemaType.Boolean()),
      minTlsVersion: SchemaType.Optional(
        SchemaType.String([
          SchemaType.Literal('1.0'),
          SchemaType.Literal('1.1'),
          SchemaType.Literal('1.2'),
        ]),
      ),
      clientCertEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isClientCertEnabled` instead',
        }),
      ),
      isClientCertEnabled: SchemaType.Optional(SchemaType.Boolean()),
      principalId: SchemaType.Optional(SchemaType.String()),
      phpVersion: SchemaType.Optional(SchemaType.String()),
      pythonVersion: SchemaType.Optional(SchemaType.String()),
      javaVersion: SchemaType.Optional(
        SchemaType.Union([SchemaType.String(), SchemaType.Null()]),
      ),
      nodeVersion: SchemaType.Optional(SchemaType.String()),
      http20Enabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isHttp20Enabled` instead',
        }),
      ),
      isHttp20Enabled: SchemaType.Optional(SchemaType.Boolean()),
      ftpsState: SchemaType.Optional(
        SchemaType.String([
          SchemaType.Literal('AllAllowed'),
          SchemaType.Literal('FtpsOnly'),
          SchemaType.Literal('Disabled'),
        ]),
      ),
    }),
  });

export const [AppServicePlanEntityMetadata, createAppServicePlanAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] App Service Plan',
    _class: ['Configuration'],
    _type: createEntityType('app_service_plan'),
    description: 'Azure App ServicePlan',
    schema: SchemaType.Object({
      type: SchemaType.Optional(SchemaType.String()),
      kind: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      location: SchemaType.Optional(SchemaType.String()),
      'sku.name': SchemaType.Optional(
        SchemaType.String({
          deprecated: true,
          description: 'Please use `skuName` instead',
        }),
      ),
      skuName: SchemaType.Optional(SchemaType.String()),
      'sku.tier': SchemaType.Optional(
        SchemaType.String({
          deprecated: true,
          description: 'Please use `skuTier` instead',
        }),
      ),
      skuTier: SchemaType.Optional(SchemaType.String()),
      'sku.size': SchemaType.Optional(
        SchemaType.String({
          deprecated: true,
          description: 'Please use `skuSize` instead',
        }),
      ),
      skuSize: SchemaType.Optional(SchemaType.String()),
      'sku.family': SchemaType.Optional(
        SchemaType.String({
          deprecated: true,
          description: 'Please use `skuFamily` instead',
        }),
      ),
      skuFamily: SchemaType.Optional(SchemaType.String()),
      'sku.capacity': SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `skuCapacity` instead',
        }),
      ),
      skuCapacity: SchemaType.Optional(SchemaType.Number()),
    }),
  });
