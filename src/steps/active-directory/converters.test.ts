import {
  Entity,
  IntegrationInstance,
  MappedRelationship,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { Organization } from '@microsoft/microsoft-graph-types';

import { GroupMember } from './client';
import {
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
} from './constants';
import {
  createAccountEntityWithOrganization,
  createAccountGroupRelationship,
  createAccountUserRelationship,
  createGroupEntity,
  createGroupMemberRelationship,
  createUserEntity,
} from './converters';

describe('createAccountEntityWithOrganization', () => {
  test('properties transferred', () => {
    const instance = {
      id: 'the-instance-id',
      name: 'instance.config.name configured by customer',
      config: {},
    } as IntegrationInstance;

    const organization: Organization = {
      displayName: 'Org Display Name',
      verifiedDomains: [
        {
          name: 'whatever.onmicrosoft.com',
        },
        {
          isDefault: true,
          name: 'something.onmicrosoft.com',
        },
      ],
    };
    const accountEntity = createAccountEntityWithOrganization(
      instance,
      organization,
    );

    expect(accountEntity).toEqual({
      _class: ['Account'],
      _key: 'azure_account_the-instance-id',
      _type: 'azure_account',
      _rawData: [{ name: 'default', rawData: organization }],
      name: 'Org Display Name',
      displayName: 'instance.config.name configured by customer',
      defaultDomain: 'something.onmicrosoft.com',
      organizationName: 'Org Display Name',
      verifiedDomains: [
        'whatever.onmicrosoft.com',
        'something.onmicrosoft.com',
      ],
    });
  });
});

describe('createGroupEntity', () => {
  test('properties transferred', () => {
    expect(
      createGroupEntity({
        id: '89fac263-2430-48fd-9278-dacfdfc89792',
        deletedDateTime: undefined,
        classification: undefined,
        createdDateTime: '2019-04-23T18:06:05Z',
        description: 'descr',
        displayName: 'test group',
        groupTypes: [],
        mail: undefined,
        mailEnabled: false,
        mailNickname: '8bb2d1c34',
        onPremisesLastSyncDateTime: undefined,
        onPremisesSecurityIdentifier: undefined,
        onPremisesSyncEnabled: undefined,
        proxyAddresses: [],
        renewedDateTime: '2019-04-23T18:06:05Z',
        securityEnabled: true,
        visibility: undefined,
        onPremisesProvisioningErrors: [],
      }),
    ).toEqual({
      _class: 'UserGroup',
      _key: 'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
      _type: 'azure_user_group',
      classification: undefined,
      createdOn: 1556042765000,
      deletedOn: undefined,
      description: 'descr',
      displayName: 'test group',
      id: '89fac263-2430-48fd-9278-dacfdfc89792',
      email: undefined,
      mail: undefined,
      mailEnabled: false,
      mailNickname: '8bb2d1c34',
      renewedOn: 1556042765000,
      securityEnabled: true,
    });
  });
});

describe('createUserEntity', () => {
  test('properties transferred', () => {
    expect(
      createUserEntity({
        businessPhones: ['+1 2223334444'],
        displayName: 'Andrew Kulakov',
        givenName: 'Andrew',
        jobTitle: 'test title',
        mail: undefined,
        mobilePhone: '+1 2223334444',
        officeLocation: 'DBP',
        preferredLanguage: undefined,
        surname: 'Kulakov',
        userPrincipalName:
          'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
        id: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      }),
    ).toEqual({
      _class: 'User',
      _key: 'azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8',
      _type: 'azure_user',
      displayName: 'Andrew Kulakov',
      givenName: 'Andrew',
      firstName: 'Andrew',
      id: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      jobTitle: 'test title',
      mail: undefined,
      email: undefined,
      mobilePhone: '+1 2223334444',
      officeLocation: 'DBP',
      preferredLanguage: undefined,
      surname: 'Kulakov',
      lastName: 'Kulakov',
      userPrincipalName:
        'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
    });
  });
});

const account = {
  _class: 'Account',
  _key: 'azure_account_id',
  _type: 'azure_account',
  displayName: 'name',
};

describe('createAccountGroupRelationship', () => {
  test('properties transferred', () => {
    expect(
      createAccountGroupRelationship(account, {
        _key: '89fac263-2430-48fd-9278-dacfdfc89792',
        _class: GROUP_ENTITY_CLASS,
        _type: GROUP_ENTITY_TYPE,
        id: '89fac263-2430-48fd-9278-dacfdfc89792',
        deletedDateTime: undefined,
        classification: undefined,
        createdDateTime: '2019-04-23T18:06:05Z',
        description: 'descr',
        displayName: 'test group',
        groupTypes: [],
        mail: undefined,
        mailEnabled: false,
        mailNickname: '8bb2d1c34',
        onPremisesLastSyncDateTime: undefined,
        onPremisesSecurityIdentifier: undefined,
        onPremisesSyncEnabled: undefined,
        proxyAddresses: [],
        renewedDateTime: '2019-04-23T18:06:05Z',
        securityEnabled: true,
        visibility: undefined,
        onPremisesProvisioningErrors: [],
      }),
    ).toEqual({
      _class: 'HAS',
      _fromEntityKey: 'azure_account_id',
      _key:
        'azure_account_id|has|azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
      _toEntityKey: 'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
      _type: 'azure_account_has_group',
      displayName: 'HAS',
    });
  });
});

describe('createAccountUserRelationship', () => {
  test('properties transferred', () => {
    expect(
      createAccountUserRelationship(account, {
        _key: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
        _class: USER_ENTITY_CLASS,
        _type: USER_ENTITY_TYPE,
        businessPhones: ['+1 2223334444'],
        displayName: 'Andrew Kulakov',
        givenName: 'Andrew',
        jobTitle: 'test title',
        mail: undefined,
        mobilePhone: '+1 2223334444',
        officeLocation: 'DBP',
        preferredLanguage: undefined,
        surname: 'Kulakov',
        userPrincipalName:
          'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
        id: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      }),
    ).toEqual({
      _class: 'HAS',
      _fromEntityKey: 'azure_account_id',
      _key:
        'azure_account_id|has|azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8',
      _toEntityKey: 'azure_user_abf00eda-02d6-4053-a077-eef036e1a4c8',
      _type: 'azure_account_has_user',
      displayName: 'HAS',
    });
  });
});

describe('createGroupMemberRelationship', () => {
  const groupEntity: Entity = {
    id: '89fac263-2430-48fd-9278-dacfdfc89792',
    _key: '89fac263-2430-48fd-9278-dacfdfc89792',
    _type: GROUP_ENTITY_TYPE,
    _class: GROUP_ENTITY_CLASS,
  };

  test('properties transferred for users', () => {
    const member: GroupMember = {
      '@odata.type': '#microsoft.graph.user',
      id: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      displayName: 'User Name',
      jobTitle: 'Job Title',
      mail: 'user@example.com',
    };

    const relationship: MappedRelationship & {
      groupId: string;
      memberId: string;
      memberType: string;
    } = {
      _class: 'HAS',
      _key:
        'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792_azure_user_324e8daa-9c29-42a4-a74b-b9893e6d9750',
      _type: 'azure_group_has_member',
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey:
          'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
        targetFilterKeys: [['_type', '_key']],
        targetEntity: {
          _key: 'azure_user_324e8daa-9c29-42a4-a74b-b9893e6d9750',
          _type: 'azure_user',
          _class: 'User',
          displayName: 'User Name',
          jobTitle: 'Job Title',
          email: 'user@example.com',
        },
      },
      groupId: '89fac263-2430-48fd-9278-dacfdfc89792',
      memberId: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      memberType: '#microsoft.graph.user',
      displayName: 'HAS',
    };

    expect(createGroupMemberRelationship(groupEntity, member)).toEqual(
      relationship,
    );
  });

  test('properties transferred for groups', () => {
    const member: GroupMember = {
      '@odata.type': '#microsoft.graph.group',
      id: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      displayName: 'Managers',
      jobTitle: null,
      mail: null,
    };

    const relationship: MappedRelationship & {
      groupId: string;
      memberId: string;
      memberType: string;
    } = {
      _class: 'HAS',
      _key:
        'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792_azure_user_group_324e8daa-9c29-42a4-a74b-b9893e6d9750',
      _type: 'azure_group_has_member',
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey:
          'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
        targetFilterKeys: [['_type', '_key']],
        targetEntity: {
          _key: 'azure_user_group_324e8daa-9c29-42a4-a74b-b9893e6d9750',
          _type: 'azure_user_group',
          _class: 'UserGroup',
          displayName: 'Managers',
          jobTitle: null,
          email: null,
        },
      },
      groupId: '89fac263-2430-48fd-9278-dacfdfc89792',
      memberId: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      memberType: '#microsoft.graph.group',
      displayName: 'HAS',
    };

    expect(createGroupMemberRelationship(groupEntity, member)).toEqual(
      relationship,
    );
  });

  test('properties transferred for other', () => {
    const member: GroupMember = {
      '@odata.type': '#microsoft.graph.directoryObject',
      id: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      displayName: "Don't really know",
      jobTitle: null,
    };

    const relationship: MappedRelationship & {
      groupId: string;
      memberId: string;
      memberType: string;
    } = {
      _class: 'HAS',
      _key:
        'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792_azure_group_member_324e8daa-9c29-42a4-a74b-b9893e6d9750',
      _type: 'azure_group_has_member',
      _mapping: {
        relationshipDirection: RelationshipDirection.FORWARD,
        sourceEntityKey:
          'azure_user_group_89fac263-2430-48fd-9278-dacfdfc89792',
        targetFilterKeys: [['_type', '_key']],
        targetEntity: {
          _key: 'azure_group_member_324e8daa-9c29-42a4-a74b-b9893e6d9750',
          _type: 'azure_group_member',
          _class: 'User',
          displayName: "Don't really know",
          jobTitle: null,
          email: undefined,
        },
      },
      groupId: '89fac263-2430-48fd-9278-dacfdfc89792',
      memberId: '324e8daa-9c29-42a4-a74b-b9893e6d9750',
      memberType: '#microsoft.graph.directoryObject',
      displayName: 'HAS',
    };

    expect(createGroupMemberRelationship(groupEntity, member)).toEqual(
      relationship,
    );
  });
});
