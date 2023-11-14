import { IntegrationInstance } from '@jupiterone/integration-sdk-core';
import { Organization, User, Group } from '@microsoft/microsoft-graph-types';

import { IdentitySecurityDefaultsEnforcementPolicy } from './client';
import {
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  ACCOUNT_ENTITY_CLASS,
} from './constants';
import {
  createAccountEntityWithOrganization,
  createAccountGroupRelationship,
  createAccountUserRelationship,
  createGroupEntity,
  createUserEntity,
  createServicePrincipalEntity,
} from './converters';

beforeAll(() => {
  process.env.ENABLE_GRAPH_OBJECT_SCHEMA_VALIDATION = '1';
});

afterAll(() => {
  delete process.env.ENABLE_GRAPH_OBJECT_SCHEMA_VALIDATION;
});

describe('createAccountEntityWithOrganization', () => {
  function createInstance(): IntegrationInstance {
    return {
      id: 'the-instance-id',
      name: 'instance.config.name configured by customer',
      config: {},
    } as IntegrationInstance;
  }

  function createOrganization(): Organization {
    return {
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
  }

  function createSecurityDefaults(): IdentitySecurityDefaultsEnforcementPolicy {
    return {
      description: 'description',
      displayName: 'displayName',
      isEnabled: true,
      id: 'id',
    };
  }
  test('properties transferred', () => {
    const instance = createInstance();
    const organization = createOrganization();
    const accountEntity = createAccountEntityWithOrganization(
      instance,
      organization,
    );

    expect(accountEntity).toEqual({
      _class: ['Account'],
      _key: 'the-instance-id',
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

  test('properties transferred with securityDefaults', () => {
    const instance = createInstance();
    const organization = createOrganization();
    const securityDefaults = createSecurityDefaults();
    const accountEntity = createAccountEntityWithOrganization(
      instance,
      organization,
      securityDefaults,
    );

    expect(accountEntity).toEqual({
      _class: ['Account'],
      _key: 'the-instance-id',
      _type: 'azure_account',
      _rawData: [
        { name: 'default', rawData: organization },
        {
          name: 'identitySecurityDefaultsEnforcementPolicy',
          rawData: securityDefaults,
        },
      ],
      name: 'Org Display Name',
      displayName: 'instance.config.name configured by customer',
      defaultDomain: 'something.onmicrosoft.com',
      organizationName: 'Org Display Name',
      verifiedDomains: [
        'whatever.onmicrosoft.com',
        'something.onmicrosoft.com',
      ],
      securityDefaultsEnabled: true,
    });

    expect(accountEntity).toMatchGraphObjectSchema({
      _class: ACCOUNT_ENTITY_CLASS,
    });
  });
});

describe('createGroupEntity', () => {
  function getMockGroup(group?: Partial<Group>) {
    return {
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
      ...(group ? group : {}),
    };
  }

  test('properties transferred', () => {
    const mockGroupEntity = createGroupEntity(getMockGroup());
    expect(mockGroupEntity).toMatchGraphObjectSchema({
      _class: GROUP_ENTITY_CLASS,
    });
    expect(mockGroupEntity).toEqual({
      _class: ['UserGroup'],
      _key: '89fac263-2430-48fd-9278-dacfdfc89792',
      _type: 'azure_user_group',
      _rawData: [expect.objectContaining({ name: 'default' })],
      createdOn: 1556042765000,
      createdDateTime: 1556042765000,
      deletedOn: undefined,
      description: 'descr',
      name: 'test group',
      displayName: 'test group',
      id: '89fac263-2430-48fd-9278-dacfdfc89792',
      email: undefined,
      mailEnabled: false,
      mailNickname: '8bb2d1c34',
      renewedOn: 1556042765000,
      renewedDateTime: 1556042765000,
      securityEnabled: true,
    });
  });

  test('should validate schema when `null` mail passed', () => {
    // Recorded API calls exposed the fact that these properties are nullable, in spite of the Typescript typings.
    const mockGroup = getMockGroup({ mail: (null as unknown) as undefined });
    const groupEntity = createGroupEntity(mockGroup);
    expect(groupEntity).toMatchGraphObjectSchema({
      _class: GROUP_ENTITY_CLASS,
    });
  });
});

describe('createUserEntity', () => {
  function getMockUser(user?: Partial<User>) {
    return {
      businessPhones: ['+1 2223334444'],
      displayName: 'Andrew Kulakov',
      givenName: 'Andrew',
      jobTitle: 'test title',
      accountEnabled: true,
      mail: 'admin_test@dualboot.com',
      mobilePhone: '+1 2223334444',
      usageLocation: 'US',
      officeLocation: 'DBP',
      preferredLanguage: undefined,
      surname: 'Kulakov',
      userPrincipalName:
        'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
      id: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      userType: 'Member',
      ...(user ? user : {}),
    };
  }

  function getMockRegistrationDetails() {
    return {
      userPrincipalName:
        'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
      userDisplayName: 'Andrew Kulakov',
      isMfaRegistered: true,
      methodsRegistered: ['mobilePhone', 'email'],
      userPreferredMethodForSecondaryAuthentication: 'sms',
    };
  }

  test('properties transferred', () => {
    const mockUser = getMockUser();
    const mockCredDetails = getMockRegistrationDetails();

    const userEntity = createUserEntity(mockUser, mockCredDetails);
    expect(userEntity).toMatchGraphObjectSchema({ _class: USER_ENTITY_CLASS });
    expect(userEntity).toEqual({
      _class: ['User'],
      _key: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      _type: 'azure_user',
      _rawData: [
        { name: 'default', rawData: mockUser },
        {
          name: 'registrationDetails',
          rawData: mockCredDetails,
        },
      ],
      accountEnabled: true,
      active: true,
      createdOn: undefined,
      email: 'admin_test@dualboot.com',
      mail: 'admin_test@dualboot.com',
      username:
        'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
      name: 'Andrew Kulakov',
      displayName: 'Andrew Kulakov',
      givenName: 'Andrew',
      firstName: 'Andrew',
      id: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      jobTitle: 'test title',
      businessPhones: ['+1 2223334444'],
      mobilePhone: '+1 2223334444',
      officeLocation: 'DBP',
      surname: 'Kulakov',
      lastName: 'Kulakov',
      userType: 'Member',
      userPrincipalName:
        'admin_test.dualboot.com#EXT#@admintestdualboot.onmicrosoft.com',
      mfaEnabled: true,
      mfaType: 'sms',
      mfaMethods: ['mobilePhone', 'email'],
    });
  });

  test('should validate schema when `null` mail passed', () => {
    // Recorded API calls exposed the fact that these properties are nullable, in spite of the Typescript typings.
    const mockUser = getMockUser({ mail: (null as unknown) as undefined });
    const userEntity = createUserEntity(mockUser);
    expect(userEntity).toMatchGraphObjectSchema({ _class: USER_ENTITY_CLASS });
  });
});

describe('createServicePrincipalEntity', () => {
  test('properties transferred', () => {
    const data = {
      id: 'service-principal-id',
      appDisplayName: 'app-display-name',
      appId: 'app-id',
      displayName: 'O365 LinkedIn Connection',
      servicePrincipalNames: [
        'app-id',
        'urn:linkedin:appurn:urn:li:developerApplication:id',
        'urn:linkedin:clientid:client-id',
      ],
      servicePrincipalType: 'SocialIdp',
      tags: ['tag 1'],
    };
    expect(createServicePrincipalEntity(data)).toEqual({
      _class: ['Service'],
      _key: 'service-principal-id',
      _rawData: [
        {
          name: 'default',
          rawData: {
            appDisplayName: 'app-display-name',
            appId: 'app-id',
            displayName: 'O365 LinkedIn Connection',
            id: 'service-principal-id',
            servicePrincipalNames: [
              'app-id',
              'urn:linkedin:appurn:urn:li:developerApplication:id',
              'urn:linkedin:clientid:client-id',
            ],
            servicePrincipalType: 'SocialIdp',
            tags: ['tag 1'],
          },
        },
      ],
      _type: 'azure_service_principal',
      function: ['service-account'],
      appDisplayName: 'app-display-name',
      appId: 'app-id',
      category: ['infrastructure'],
      displayName: 'O365 LinkedIn Connection',
      id: 'service-principal-id',
      name: 'O365 LinkedIn Connection',
      servicePrincipalNames: [
        'app-id',
        'urn:linkedin:appurn:urn:li:developerApplication:id',
        'urn:linkedin:clientid:client-id',
      ],
      servicePrincipalType: 'SocialIdp',
      tags: ['tag 1'],
      userType: 'service',
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
      _key: 'azure_account_id|has|89fac263-2430-48fd-9278-dacfdfc89792',
      _toEntityKey: '89fac263-2430-48fd-9278-dacfdfc89792',
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
      _key: 'azure_account_id|has|abf00eda-02d6-4053-a077-eef036e1a4c8',
      _toEntityKey: 'abf00eda-02d6-4053-a077-eef036e1a4c8',
      _type: 'azure_account_has_user',
      displayName: 'HAS',
    });
  });
});
