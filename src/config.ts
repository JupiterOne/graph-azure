import { IntegrationIngestionConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { INGESTION_SOURCE_IDS } from './constants';

export const ingestionConfig: IntegrationIngestionConfigFieldMap = {
  [INGESTION_SOURCE_IDS.AD_GENERALS]: {
    title: 'Active directory generals',
    description:
      'Gather information related to user identities, authentication events, and access permissions.',
    defaultsToDisabled: false,
    cannotBeDisabled: true,
  },
  [INGESTION_SOURCE_IDS.AD_GROUPS]: {
    title: 'Active directory groups',
    description:
      'Gather information related to user groups and group membership.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.AD_DEVICES]: {
    title: 'Active directory devices',
    description:
      'Gather information related to user devices and device ownership.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.ADVISOR_RECOMMENDATIONS]: {
    title: 'Advisor recommendations',
    description: 'Ingest recommendations generated by Azure advisor.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.API_MANAGEMENT]: {
    title: 'API management',
    description:
      'Ingest API management services and application programming interfaces.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.APPLICATION_SECURITY_GROUP]: {
    title: 'Application Security Group',
    description:
      'Ingest API management services and application security group.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.APPSERVICE]: {
    title: 'App service',
    description: 'Ingest apps and service plans.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.AUTHORIZATION]: {
    title: 'Authorization',
    description: 'Ingest roles, role assignments and classic administrators.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.BATCH]: {
    title: 'Batch',
    description: 'Ingest batch accounts, pools, applications and certificates.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CDN]: {
    title: 'Content delivery network',
    description: 'Ingest profiles and networks.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.COMPUTE]: {
    title: 'Compute',
    description: 'Ingest galleries, images and virtual machines.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_INSTANCE]: {
    title: 'Container instances',
    description: 'Ingest container instances.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_REGISTRY]: {
    title: 'Container registry',
    description: 'Ingest registry and registry webhooks.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_SERVICES]: {
    title: 'Container clusters',
    description: 'Ingest container clusters services.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.CONTAINER_SERVICES_EXTRAS]: {
    title: 'Container clusters extra information',
    description:
      'Ingest container clusters maintenance configuration and kubernetes specific data.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.COSMOSDB]: {
    title: 'Cosmos Database',
    description: 'Gather information about Cosmos database.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.DATABASES]: {
    title: 'Databases',
    description:
      'Gather information about MySQL, PostgreSQL, MariaDB and SQL instances.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.DNS]: {
    title: 'Public DNS',
    description: 'Gather information about public zones and record sets.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.EVENT_GRID]: {
    title: 'Event grid',
    description: 'Gather information about domains and topics.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.EVENT_HUB]: {
    title: 'Event hub',
    description: 'Gather information about cluster and namespaces.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.EXPRESS_ROUTE]: {
    title: 'Express Route',
    description: 'Gather information about Route Circuit and Peer Connections.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SYNAPSE]: {
    title: 'Synapse Service',
    description: 'Gather information about Sql Pools and Workspaces.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.DDOS]: {
    title: 'DDOS',
    description: 'Gather information about Ddos Protection Plans.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.FRONTDOOR]: {
    title: 'Frontdoor',
    description: 'Gather information frontdoors, rules, pools and endpoints.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.KEY_VAULT]: {
    title: 'Key vault',
    description: 'Gather information key vaults, keys and secrets.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.MANAGEMENT_GROUPS]: {
    title: 'Management groups',
    description: 'Gather management group details.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.MONITOR]: {
    title: 'Monitor log',
    description: 'Gather monitor alerts and profiles.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.NETWORK]: {
    title: 'Network',
    description:
      'Fetch network configuration and information, such as public IP addresses, network interfaces, virtual networks, security groups, load balancers, Azure Firewalls, private endpoints, and more',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.POLICY]: {
    title: 'Authorization policy',
    description: 'Gather information about policy assignments and definitions.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.POLICY_INSIGHTS]: {
    title: 'Authorization policy insights',
    description: 'Gather insights about policy states and relationships.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.PRIVATE_DNS]: {
    title: 'Private DNS',
    description: 'Gather information about private zones and record sets.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.REDIS_CACHE]: {
    title: 'Private DNS',
    description: 'Ingest redis cache, firewall rules and redis linked servers.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.RESOURCES]: {
    title: 'Resource groups',
    description: 'Ingest resource groups and locks.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SECURITY]: {
    title: 'Security details',
    description:
      'Fetch information about assessments, contacts, pricing configurations and settings.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SERVICE_BUS]: {
    title: 'Service bus',
    description: 'Ingest service bus namespaces, queues and topics.',
    defaultsToDisabled: false,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.STORAGE]: {
    title: 'Storage',
    description:
      'Ingest storage accounts, tables, queues, containers and file shares.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.SUBSCRIPTIONS]: {
    title: 'Subscriptions',
    description: 'Ingest subscription details and locations.',
    defaultsToDisabled: false,
    cannotBeDisabled: true,
  },
  [INGESTION_SOURCE_IDS.SUBSCRIPTION_USAGE]: {
    title: 'Subscription Usage',
    description: 'Ingest subscription usage details.',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
  [INGESTION_SOURCE_IDS.DEFENDER_ALERTS]: {
    title: 'Defender Alerts',
    description: 'Ingest defender for cloud alerts',
    defaultsToDisabled: true,
    cannotBeDisabled: false,
  },
};
