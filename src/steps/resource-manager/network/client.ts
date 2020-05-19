import { NetworkManagementClient } from "@azure/arm-network";
import { NetworkInterface } from "@azure/arm-network/esm/models";

import {
  Client,
  iterateAllResources,
} from "../../../azure/resource-manager/client";

export class NetworkClient extends Client {
  public async iterateNetworkInterfaces(
    callback: (nic: NetworkInterface) => void | Promise<void>,
  ): Promise<void> {
    const serviceClient = await this.getAuthenticatedServiceClient(
      NetworkManagementClient,
    );
    return iterateAllResources({
      logger: this.logger,
      serviceClient,
      resourceEndpoint: serviceClient.networkInterfaces,
      resourceDescription: "networkInterfaces",
      callback,
    });
  }
}
