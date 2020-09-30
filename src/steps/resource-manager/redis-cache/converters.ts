import { AzureWebLinker } from '../../../azure';
import { RedisResource } from '@azure/arm-rediscache/esm/models';
import {
  convertProperties,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { RedisCacheEntities } from './constants';

export function createRedisCacheEntity(
  webLinker: AzureWebLinker,
  data: RedisResource,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...convertProperties(data),
        _key: data.id as string,
        _type: RedisCacheEntities.CACHE._type,
        _class: RedisCacheEntities.CACHE._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        /**
         * While by default Azure Cache for Redis encrypts all data in transit using TLS 1.2 encryption,
         * it is possible for a customer to turn this off or use TLS 1.0 or TLS 1.1, thus leaving them open to vulnerabilities.
         * Azure Cache for Redis also stores customer data in memory, and data in memory is not encrypted by default
         * Azure recommends encrypting any content before storing it in Azure Cache for Redis.
         * https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/security-baseline#48-encrypt-sensitive-information-at-rest
         * This means that whether or not the data is encrypted (in transmission or in storage) is dependent on the customer and therefore unknown.
         */
        encrypted: null,
        /**
         * We do not know the type or classification of data the customer is storing in the Azure Cache for Redis.
         */
        classification: null,
      },
    },
  });
}
