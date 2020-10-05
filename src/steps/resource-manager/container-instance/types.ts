import { Container, Volume } from '@azure/arm-containerinstance/esm/models';

/**
 * Azure Containers in an Azure Container Group do not have ids.
 * This type is used to encapsulate an Azure Container with an id property that we create.
 * Our own id is created by using the id of the Azure Container Group and pre-pending it to the container name.
 * The result should look something like `subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups/${containerGroup}/containers/${containerName}
 */
export type ContainerWithId = Container & { id: string };

/**
 * Azure Container Volumes do not have ids.
 * This type is used to encapsulate an Azure Container Volume with an id property that we create.
 * Our own id is created by using the id of the Azure Container Group and pre-pending it to the volume name.
 * The result should look something like `subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerInstance/containerGroups/${containerGroup}/volumes/${volumeName}
 */
export type VolumeWithId = Volume & { id: string };
