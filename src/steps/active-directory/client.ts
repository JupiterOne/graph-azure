import {
  DirectoryObject,
  DirectoryRole,
  Group,
  User,
} from '@microsoft/microsoft-graph-types';

import { GraphClient, QueryParams } from '../../azure/graph/client';

export enum MemberType {
  USER = '#microsoft.graph.user',
  GROUP = '#microsoft.graph.group',
}

/**
 * A type tracking the selected data answered by a request for group members.
 * The properties are those requested. Additional properties should be added
 * here and in `iterateGroupMembers` to communicate what we're requesting.
 */
export interface GroupMember extends DirectoryObject {
  '@odata.type': string;
  displayName?: string;
  mail?: string | null;
  jobTitle?: string | null;
}

export class DirectoryGraphClient extends GraphClient {
  // https://docs.microsoft.com/en-us/graph/api/directoryrole-list?view=graph-rest-1.0&tabs=http
  public async iterateDirectoryRoles(
    callback: (role: DirectoryRole) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info('Iterating directory roles.');
    return this.iterateResources({ resourceUrl: '/directoryRoles', callback });
  }

  // https://docs.microsoft.com/en-us/graph/api/directoryrole-list-members?view=graph-rest-1.0&tabs=http
  public async iterateDirectoryRoleMembers(
    roleId: string,
    callback: (member: DirectoryObject) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info({ roleId }, 'Iterating directory role members.');
    return this.iterateResources({
      resourceUrl: `/directoryRoles/${roleId}/members`,
      callback,
    });
  }

  // https://docs.microsoft.com/en-us/graph/api/group-list?view=graph-rest-1.0&tabs=http
  public async iterateGroups(
    callback: (user: Group) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info('Iterating groups.');
    return this.iterateResources({ resourceUrl: '/groups', callback });
  }

  // https://docs.microsoft.com/en-us/graph/api/group-list-members?view=graph-rest-1.0&tabs=http
  public async iterateGroupMembers(
    input: {
      groupId: string;
      /**
       * The property names for `$select` query param.
       */
      select?: string | string[];
    },
    callback: (user: GroupMember) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info({ groupId: input.groupId }, 'Iterating group members.');
    const $select = input.select
      ? Array.isArray(input.select)
        ? input.select.join(',')
        : input.select
      : undefined;

    return this.iterateResources({
      resourceUrl: `/groups/${input.groupId}/members`,
      query: $select ? { $select } : undefined,
      callback,
    });
  }

  // https://docs.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
  public async iterateUsers(
    callback: (user: User) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info('Iterating users.');
    return this.iterateResources({ resourceUrl: '/users', callback });
  }

  // https://docs.microsoft.com/en-us/graph/api/serviceprincipal-list?view=graph-rest-1.0&tabs=http
  public async iterateServicePrincipals(
    callback: (a: any) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info('Iterating service principals.');
    return this.iterateResources({
      resourceUrl: '/servicePrincipals',
      callback,
    });
  }

  // Not using PageIterator because it doesn't allow async callback
  private async iterateResources<T>({
    resourceUrl,
    query,
    callback,
  }: {
    resourceUrl: string;
    query?: QueryParams;
    callback: (item: T) => void | Promise<void>;
  }): Promise<void> {
    let nextLink: string | undefined;
    do {
      let api = this.client.api(nextLink || resourceUrl);
      if (query) {
        api = api.query(query);
      }

      const response = await this.request(api);
      if (response) {
        nextLink = response['@odata.nextLink'];
        for (const value of response.value) {
          try {
            await callback(value);
          } catch (err) {
            this.logger.error(
              {
                resourceUrl,
              },
              'Callback error while iterating an API response in DirectoryGraphClient',
            );
          }
        }
      } else {
        nextLink = undefined;
      }
    } while (nextLink);
  }
}
