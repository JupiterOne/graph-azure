import * as msRest from '@azure/ms-rest-js';

export const apiVersion: msRest.OperationQueryParameter = {
  parameterPath: 'apiVersion',
  mapper: {
    defaultValue: '2023-04-01',
    isConstant: true,
    serializedName: 'api-version',
    type: {
      name: 'String',
    },
  },
};
export const $host: msRest.OperationURLParameter = {
  parameterPath: '$host',
  mapper: {
    serializedName: '$host',
    required: true,
    type: {
      name: 'String',
    },
  },
  skipEncoding: true,
};
export const resourceGroupName: msRest.OperationURLParameter = {
  parameterPath: 'resourceGroupName',
  mapper: {
    serializedName: 'resourceGroupName',
    required: true,
    type: {
      name: 'String',
    },
  },
};
export const subscriptionId: msRest.OperationURLParameter = {
  parameterPath: 'subscriptionId',
  mapper: {
    serializedName: 'subscriptionId',
    required: true,
    type: {
      name: 'String',
    },
  },
};
export const firewallPolicyName: msRest.OperationURLParameter = {
  parameterPath: 'firewallPolicyName',
  mapper: {
    serializedName: 'firewallPolicyName',
    required: true,
    type: {
      name: 'String',
    },
  },
};
export const accept: msRest.OperationParameter = {
  parameterPath: 'accept',
  mapper: {
    defaultValue: 'application/json',
    isConstant: true,
    serializedName: 'Accept',
    type: {
      name: 'String',
    },
  },
};
export const nextLink: msRest.OperationURLParameter = {
  parameterPath: 'nextLink',
  mapper: {
    serializedName: 'nextLink',
    required: true,
    type: {
      name: 'String',
    },
  },
  skipEncoding: true,
};
