import { ComputeManagementClient } from "@azure/arm-compute";
import { VirtualMachine } from "@azure/arm-compute/esm/models";

export default async function iterateVirtualMachines(
  client: ComputeManagementClient,
  callback: (vm: VirtualMachine) => void,
) {
  let nextLink: string | undefined;
  do {
    const response = nextLink
      ? /* istanbul ignore next: how to control page number? */
        await client.virtualMachines.listAllNext(nextLink)
      : await client.virtualMachines.listAll();

    for (const e of response) {
      callback(e);
    }

    nextLink = response.nextLink;
  } while (nextLink);
}
