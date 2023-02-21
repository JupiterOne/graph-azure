import {
  mutations,
  Recording,
  RecordingEntry,
  setupRecording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';
import { isJson } from '../../src/utils/isJson';
import { IntegrationConfig } from '../../src/types';
import { MatchBy } from '@pollyjs/core';

export { Recording };

export const azureMutations = {
  ...mutations,
  mutateAccessToken,
  redactAllPropertiesExcept,
};

export function setupAzureRecording(input: SetupRecordingInput): Recording {
  return setupRecording({
    mutateEntry: mutateRecordingEntry,
    ...input,
  });
}

function mutateRecordingEntry(entry: RecordingEntry): void {
  azureMutations.unzipGzippedRecordingEntry(entry);
  azureMutations.mutateAccessToken(entry, () => '[REDACTED]');
}

function mutateAccessToken(
  entry: RecordingEntry,
  mutation: (accessToken: string) => string,
) {
  const responseText = entry.response.content.text;
  if (!responseText) {
    return;
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
            access_token: mutation(responseJson.access_token),
          },
          null,
          0,
        );
      }
    }
  }
}

export function mutateSubscriptionAndDirectory(entry: RecordingEntry, config) {
  mutateRecordingEntry(entry);
  if (!entry.response.content.text || !entry.request.url) {
    return;
  }

  entry.request.url = entry.request.url
    .replace(new RegExp(`${config.directoryId}`, 'g'), 'directory-id')
    .replace(new RegExp(`${config.subscriptionId}`, 'g'), 'subscription-id');

  entry.response.content.text = entry.response.content.text
    .replace(new RegExp(`${config.directoryId}`, 'g'), 'directory-id')
    .replace(new RegExp(`${config.subscriptionId}`, 'g'), 'subscription-id');
}

function redactAllPropertiesExcept(
  entry: RecordingEntry,
  requiredProperties: string[],
) {
  const responseText = entry.response.content.text;
  if (!responseText) {
    return;
  }

  if (isJson(responseText)) {
    const responseJson = JSON.parse(responseText);

    for (const key of Object.keys(responseJson)) {
      if (!requiredProperties.includes(key)) {
        responseJson[key] = '[REDACTED:UNUSED]';
      }
    }
    entry.response.content.text = JSON.stringify(responseJson);
  }
}

type MatchRequestsBy = Required<
  SetupRecordingInput
>['options']['matchRequestsBy'];

interface UrlOptions {
  protocol?: boolean | MatchBy<string, string> | undefined;
  username?: boolean | MatchBy<string, string> | undefined;
  password?: boolean | MatchBy<string, string> | undefined;
  hostname?: boolean | MatchBy<string, string> | undefined;
  port?: boolean | MatchBy<number, number> | undefined;
  pathname?: boolean | MatchBy<string, string> | undefined;
  query?:
    | boolean
    | MatchBy<{ [key: string]: any }, { [key: string]: any }>
    | undefined;
  hash?: boolean | MatchBy<string, string> | undefined;
}

export function getMatchRequestsBy({
  config,
  shouldReplaceSubscriptionId = defaultShouldReplaceSubscriptionId,
  options,
}: {
  config: IntegrationConfig;
  shouldReplaceSubscriptionId?: (pathname: string) => boolean;
  options?: MatchRequestsBy;
}): MatchRequestsBy {
  let url: UrlOptions | undefined;
  if (options?.url) {
    url = options.url as UrlOptions;
    delete options.url;
  }

  return {
    headers: false,
    url: {
      ...(url && { ...url }),
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

export function defaultShouldReplaceSubscriptionId(pathname: string): boolean {
  // By default, we expect that a subscriptionId that exists inside an API path used config.subscriptionId,
  // and should be replaced.
  return true;
}
