

async function fetchPublicIPAddresses(
  client: ResourceManagerClient,
  webLinker: AzureWebLinker,
): Promise<PublicIPAddressEntity[]> {
  const entities: PublicIPAddressEntity[] = [];
  await client.iteratePublicIPAddresses((e) => {
    entities.push(createPublicIPAddressEntity(webLinker, e));
  });
  return entities;
}


async function synchronizeNetworkResources(
  executionContext: AzureExecutionContext,
  webLinker: AzureWebLinker,
): Promise<NetworkSynchronizationResults> {
  const { graph, logger, persister, azrm } = executionContext;

  const results: PersisterOperationsResult[] = [];

  const [oldAddresses, newAddresses] = await Promise.all([
    graph.findEntitiesByType(PUBLIC_IP_ADDRESS_ENTITY_TYPE),
    fetchPublicIPAddresses(azrm, webLinker),
  ]);

  const [oldNics, newNics] = (await Promise.all([
    graph.findEntitiesByType(NETWORK_INTERFACE_ENTITY_TYPE),
    fetchNetworkInterfaces(azrm, webLinker),
  ])) as [EntityFromIntegration[], NetworkInterfaceEntity[]];

  const [oldLoadBalancers, newLoadBalancers] = (await Promise.all([
    graph.findEntitiesByType(LOAD_BALANCER_ENTITY_TYPE),
    fetchLoadBalaners(azrm, webLinker),
  ])) as [EntityFromIntegration[], EntityFromIntegration[]];

  for (const nic of newNics) {
    const nicData = getRawData(
      nic as EntityFromIntegration,
    ) as NetworkInterface;
    const publicIp: string[] = [];
    for (const c of nicData.ipConfigurations || []) {
      const ipAddress = newAddresses.find(
        (i) => i._key === (c.publicIPAddress && c.publicIPAddress.id),
      ) as PublicIPAddressEntity;
      if (ipAddress && ipAddress.publicIp) {
        publicIp.push(ipAddress.publicIp);
      }
    }
    Object.assign(nic, {
      publicIp,
      publicIpAddress: publicIp,
    });
  }

  const [
    oldLoadBalancerBackendNicRelationships,
    oldSecurityGroups,
    oldSecurityGroupNicRelationships,
    oldSecurityGroupRuleRelationships,
    newSecurityGroups,
  ] = (await Promise.all([
    graph.findRelationshipsByType(LB_BACKEND_NIC_RELATIONSHIP_TYPE),
    graph.findEntitiesByType(SECURITY_GROUP_ENTITY_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_NIC_RELATIONSHIP_TYPE),
    graph.findRelationshipsByType(SECURITY_GROUP_RULE_RELATIONSHIP_TYPE),
    fetchNetworkSecurityGroups(azrm, webLinker),
  ])) as [
    IntegrationRelationship[],
    EntityFromIntegration[],
    IntegrationRelationship[],
    IntegrationRelationship[],
    EntityFromIntegration[],
  ];

  const newLoadBalancerBackendNicRelationships = [];
  for (const lb of newLoadBalancers) {
    newLoadBalancerBackendNicRelationships.push(
      ...processLoadBalancerBackends(lb),
    );
  }

  const subnetSecurityGroupMap: {
    [subnetId: string]: NetworkSecurityGroup;
  } = {};
  const newSecurityGroupNicRelationships: IntegrationRelationship[] = [];
  const newSecurityGroupRuleRelationships: IntegrationRelationship[] = [];

  for (const sge of newSecurityGroups) {
    const sg = getRawData(sge) as NetworkSecurityGroup;
    if (sg.subnets) {
      for (const s of sg.subnets) {
        subnetSecurityGroupMap[s.id as string] = sg;
      }
    }
    if (sg.networkInterfaces) {
      for (const i of sg.networkInterfaces) {
        newSecurityGroupNicRelationships.push(
          createNetworkSecurityGroupNicRelationship(sg, i),
        );
      }
    }

    const rules = [
      ...(sg.defaultSecurityRules || []),
      ...(sg.securityRules || []),
    ];

    Object.assign(sge, {
      wideOpen: isWideOpen(rules),
    });

    newSecurityGroupRuleRelationships.push(
      ...createSecurityGroupRuleRelationships(sg, executionContext.instance.id),
    );
  }

  results.push(
    await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldSecurityGroups, newSecurityGroups),
        ...persister.processEntities(oldAddresses, newAddresses),
        ...persister.processEntities(oldNics, newNics),
        ...persister.processEntities(oldLoadBalancers, newLoadBalancers),
      ],
      [
        ...persister.processRelationships(
          oldLoadBalancerBackendNicRelationships,
          newLoadBalancerBackendNicRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupNicRelationships,
          newSecurityGroupNicRelationships,
        ),
        ...persister.processRelationships(
          oldSecurityGroupRuleRelationships,
          newSecurityGroupRuleRelationships,
        ),
      ],
    ]),
  );

  const newVirtualNetworks = await fetchVirtualNetworks(
    logger,
    azrm,
    webLinker,
  );
  if (newVirtualNetworks) {
    const newSubnets: EntityFromIntegration[] = [];
    const newVnetSubnetRelationships: IntegrationRelationship[] = [];
    const newSecurityGroupSubnetRelationships: IntegrationRelationship[] = [];

    for (const vnetEntity of newVirtualNetworks) {
      const vnet = getRawData(vnetEntity) as VirtualNetwork;
      if (vnet.subnets) {
        for (const s of vnet.subnets) {
          const subnetEntity = createSubnetEntity(webLinker, vnet, s);
          newSubnets.push(subnetEntity);
          newVnetSubnetRelationships.push(
            createVirtualNetworkSubnetRelationship(vnet, s),
          );
          const sg = subnetSecurityGroupMap[s.id as string];
          if (sg) {
            newSecurityGroupSubnetRelationships.push(
              createNetworkSecurityGroupSubnetRelationship(sg, s),
            );
          }
        }
      }
    }

    const [
      oldSubnets,
      oldVirtualNetworks,
      oldVnetSubnetRelationships,
      oldSecurityGroupSubnetRelationships,
    ] = (await Promise.all([
      graph.findEntitiesByType(SUBNET_ENTITY_TYPE),
      graph.findEntitiesByType(VIRTUAL_NETWORK_ENTITY_TYPE),
      graph.findRelationshipsByType(VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE),
      graph.findRelationshipsByType(SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE),
    ])) as [
      EntityFromIntegration[],
      EntityFromIntegration[],
      IntegrationRelationship[],
      IntegrationRelationship[],
    ];

    results.push(
      await persister.publishPersisterOperations([
        [
          ...persister.processEntities(oldVirtualNetworks, newVirtualNetworks),
          ...persister.processEntities(oldSubnets, newSubnets),
        ],
        [
          ...persister.processRelationships(
            oldVnetSubnetRelationships,
            newVnetSubnetRelationships,
          ),
          ...persister.processRelationships(
            oldSecurityGroupSubnetRelationships,
            newSecurityGroupSubnetRelationships,
          ),
        ],
      ]),
    );
  }

  return {
    nics: newNics.map((e) => getRawData(e)),
    operationsResult: summarizePersisterOperationsResults(...results),
  };
}