import { gunzipSync } from 'zlib';

import {
  Recording,
  RecordingEntry,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { isJson } from '../../src/utils/isJson';
import { IntegrationConfig } from '../../src/types';

export { Recording };

export function setupAzureRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    mutateEntry: mutateRecordingEntry,
  });
}

function mutateRecordingEntry(entry: RecordingEntry): void {
  let responseText = entry.response.content.text;
  if (!responseText) {
    return;
  }

  const contentEncoding = entry.response.headers.find(
    (e) => e.name === 'content-encoding',
  );
  const transferEncoding = entry.response.headers.find(
    (e) => e.name === 'transfer-encoding',
  );

  if (contentEncoding && contentEncoding.value === 'gzip') {
    const chunkBuffers: Buffer[] = [];
    const hexChunks = JSON.parse(responseText) as string[];
    hexChunks.forEach((chunk) => {
      const chunkBuffer = Buffer.from(chunk, 'hex');
      chunkBuffers.push(chunkBuffer);
    });

    responseText = gunzipSync(Buffer.concat(chunkBuffers)).toString('utf-8');

    // Remove encoding/chunking since content is now unzipped
    entry.response.headers = entry.response.headers.filter(
      (e) => e && e !== contentEncoding && e !== transferEncoding,
    );
    // Remove recording binary marker
    delete (entry.response.content as any)._isBinary;
    entry.response.content.text = responseText;
  }

  if (isJson(responseText)) {
    const responseJson = JSON.parse(responseText);

    if (/login/.exec(entry.request.url) && entry.request.postData) {
      // Redact request body with secrets for authentication
      entry.request.postData.text = '[REDACTED]';

      // Redact authentication response token
      if (responseJson.access_token) {
        entry.response.content.text = JSON.stringify(
          {
            ...responseJson,
            /* eslint-disable-next-line @typescript-eslint/camelcase */
            access_token: '[REDACTED]',
          },
          null,
          0,
        );
      }
    }
  }
}

type MatchRequestsBy = Required<
  SetupRecordingInput
>['options']['matchRequestsBy'];

export function getMatchRequestsBy({
  config,
  options,
}: {
  config: IntegrationConfig;
  options?: MatchRequestsBy;
}): MatchRequestsBy {
  return {
    headers: false,
    url: {
      pathname: (pathname: string): string => {
        pathname = pathname.replace(config.directoryId, 'directory-id');
        if (shouldReplaceSubscriptionId(pathname)) {
          pathname = pathname.replace(
            config.subscriptionId || 'subscription-id',
            'subscription-id',
          );
        }
        return pathname;
      },
    },
    ...options,
  };
}

export function shouldReplaceSubscriptionId(pathname: string): boolean {
  if (pathname.startsWith('//subscriptions')) {
    // Paths that start with `//subscriptions` are an indication that an _exact_ resource ID was used to
    // create the request, meaning the REST endpoint originated from an earlier API response.
    //
    // ``` typescript
    // const resourceId = '/subscriptions/<s-id>/resourceGroups/<rg-id>/providers/Microsoft.KeyVault/vaults/<kv-id>
    // const path = `https://management.azure.com/${resourceId}/providers/microsoft.insights/diagnosticSettings`;
    // const response = await fetch(path);
    // ```
    //
    // Paths that do _not_ start with `//subscriptions`, but contain a subscription ID, may be
    // fetching all resources for a subscription, meaning the REST endpoint originated from the
    // instance config (and should be replaced in the recording).
    //
    // ``` typescript
    // const resourceGroupName = 'j1dev';
    // const keyVaultName = 'ndowmon11-j1dev';
    // const path = `https://management.azure.com/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.KeyVault/vaults/${keyVaultName}`;
    // const response = await fetch(path);
    // ```
    return false;
  }

  // By default, we expect that a subscriptionId that exists inside an API path used config.subscriptionId,
  // and should be replaced.
  return true;
}
