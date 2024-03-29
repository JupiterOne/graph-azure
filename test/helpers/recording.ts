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

export function setupAzureRecording(
  input: SetupRecordingInput,
  config?: IntegrationConfig,
): Recording {
  return setupRecording({
    mutateEntry: (entry) => mutateSubscriptionAndDirectory(entry, config),
    options: config
      ? {
          matchRequestsBy: getMatchRequestsBy({
            config: config,
          }),
        }
      : undefined,
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

export function mutateSubscriptionAndDirectory(
  entry: RecordingEntry,
  config?: IntegrationConfig,
) {
  mutateRecordingEntry(entry);
  if (!config) {
    return;
  }
  if (entry.response.content.text) {
    entry.response.content.text = entry.response.content.text
      .replace(new RegExp(config.directoryId, 'g'), 'directory-id')
      .replace(new RegExp(config.subscriptionId!, 'g'), 'subscription-id');
  }
  if (entry.request.url) {
    entry.request.url = entry.request.url
      .replace(new RegExp(config.directoryId, 'g'), 'directory-id')
      .replace(new RegExp(config.subscriptionId!, 'g'), 'subscription-id');
  }
  if (entry.request.queryString) {
    entry.request.queryString = entry.request.queryString.map((entry) => ({
      name: entry.name,
      value: entry.value
        .replace(new RegExp(config.directoryId, 'g'), 'directory-id')
        .replace(new RegExp(config.subscriptionId!, 'g'), 'subscription-id'),
    }));
  }
  if (entry.response.headers) {
    entry.response.headers = entry.response.headers.map((entry) => ({
      name: entry.name,
      value: entry.value
        .toString()
        .replace(new RegExp(config.directoryId, 'g'), 'directory-id')
        .replace(new RegExp(config.subscriptionId!, 'g'), 'subscription-id'),
    }));
  }
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

type MatchRequestsBy =
  Required<SetupRecordingInput>['options']['matchRequestsBy'];

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
  options,
}: {
  config: IntegrationConfig;
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
        pathname = pathname.replace(
          config.directoryId.toLowerCase(),
          'directory-id',
        );
        pathname = pathname.replace(
          config.subscriptionId || 'subscription-id',
          'subscription-id',
        );
        pathname = pathname.replace(
          config.subscriptionId?.toLowerCase() || 'subscription-id',
          'subscription-id',
        );
        return pathname;
      },
    },
    ...options,
  };
}
