import {
  DirectoryObject,
  DirectoryRole,
  Group,
  User,
} from '@microsoft/microsoft-graph-types';

import { GraphClient } from '../../azure/graph/client';
import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';

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

export interface IdentitySecurityDefaultsEnforcementPolicy
  extends DirectoryObject {
  description: string;
  displayName: string;
  id: string;
  isEnabled: boolean;
}

export class DirectoryGraphClient extends GraphClient {
  // https://docs.microsoft.com/en-us/graph/api/identitysecuritydefaultsenforcementpolicy-get?view=graph-rest-beta&tabs=http
  public async fetchIdentitySecurityDefaultsEnforcementPolicy(): Promise<
    IdentitySecurityDefaultsEnforcementPolicy | undefined
  > {
    const path = '/policies/identitySecurityDefaultsEnforcementPolicy';
    let response;
    try {
      response = await this.request<IdentitySecurityDefaultsEnforcementPolicy>(
        this.client.api(path),
      );
    } catch (err) {
      if (err instanceof IntegrationProviderAPIError) {
        if (
          err._cause?.message ===
          'You cannot perform the requested operation, required scopes are missing in the token.'
        ) {
          this.logger.publishEvent({
            name: 'auth',
            description: `Unable to fetch data from ${path}. See https://github.com/JupiterOne/graph-azure/blob/master/docs/jupiterone.md#permissions for more information about optional permissions for this integration.`,
          });
          return;
        }
      }

      // This endpoint is brittle, since it behaves differently whether the default directory (tenant) is a "personal"
      // account or a "school/work" account. In order to protect us from execution failures during an important active directory
      // step, we'll never throw an error here but _explicitly_ warn operators (developers) using logger.error, and
      // also send a message to sentry via logger.onFailure.
      //
      // In the future when this endpoint is better understood, we can improve the handling here.
      this.logger.error(err);
      try {
        (this.logger as any).onFailure({ err });
      } catch (err) {
        // pass
      }
    }
    return response;
  }

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
      select?: string[];
    },
    callback: (user: GroupMember) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info({ groupId: input.groupId }, 'Iterating group members.');

    return this.iterateResources({
      resourceUrl: `/groups/${input.groupId}/members`,
      options: { select: input.select },
      callback,
    });
  }

  // https://docs.microsoft.com/en-us/graph/api/user-list?view=graph-rest-1.0&tabs=http
  public async iterateUsers(
    callback: (user: User) => void | Promise<void>,
  ): Promise<void> {
    this.logger.info('Iterating users.');
    const defaultSelect = [
      'businessPhones',
      'displayName',
      'givenName',
      'jobTitle',
      'mail',
      'mobilePhone',
      'officeLocation',
      'preferredLanguage',
      'surname',
      'userPrincipalName',
      'id',
    ];
    const select = [...defaultSelect, 'userType'];
    return this.iterateResources({
      resourceUrl: '/users',
      options: { select },
      callback,
    });
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
    options,
    callback,
  }: {
    resourceUrl: string;
    options?: { select?: string[] };
    callback: (item: T) => void | Promise<void>;
  }): Promise<void> {
    let nextLink: string | undefined;
    do {
      let api = this.client.api(nextLink || resourceUrl);
      api.select;
      if (options?.select) {
        api = api.select(options.select);
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
