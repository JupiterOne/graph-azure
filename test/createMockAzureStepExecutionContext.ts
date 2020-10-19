import {
  CreateMockStepExecutionContextOptions,
  createMockStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../src/types';
import { invocationConfig } from '../src';

export function createMockAzureStepExecutionContext(
  options: CreateMockStepExecutionContextOptions<IntegrationConfig>,
) {
  return createMockStepExecutionContext<IntegrationConfig>({
    ...options,
    normalizeGraphObjectKey: invocationConfig.normalizeGraphObjectKey,
  });
}
