import { JobState } from '@jupiterone/integration-sdk-core';
import { getAccountEntity } from '../steps/active-directory';
import { AzureWebLinker } from './types';

/**
 * Matches Blob storage service container ID, extracting:
 *
 * 1 - storage account ID
 * 2 - container path
 *
 * Example string:
 *
 *   "/subscriptions/dccea45f-7035-4a17-8731-1fd46aaa74a0/resourceGroups/j1dev/providers/Microsoft.Storage/storageAccounts/j1dev/blobServices/default/containers/bootdiagnostics-j1dev-58e204bf-f42b-4fdf-ac34-37409045a752"
 */
const blobStorageId = /(\/subscriptions\/.+\/resourceGroups\/.+\/providers\/Microsoft.Storage\/storageAccounts\/.+)\/blobServices\/.+\/containers\/(.+)/;

export default function createAzureWebLinker(
  defaultDomain: string | undefined,
): AzureWebLinker {
  return {
    portalResourceUrl: (path): string | undefined => {
      if (defaultDomain && path) {
        const m = blobStorageId.exec(path);

        if (m) {
          return `https://portal.azure.com/#blade/Microsoft_Azure_Storage/ContainerMenuBlade/overview/storageAccountId/${encodeURIComponent(
            m[1],
          )}/path/${m[2]}`;
        } else {
          return `https://portal.azure.com/#@${defaultDomain}/resource${path}`;
        }
      }
    },
  };
}

export async function getAzureWebLinker(
  jobState: JobState,
): Promise<AzureWebLinker> {
  const accountEntity = await getAccountEntity(jobState);
  return createAzureWebLinker(accountEntity.defaultDomain as string);
}
