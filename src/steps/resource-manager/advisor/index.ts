import { AzureIntegrationStep } from '../../../types';
import { recommendationSteps } from './executionHandlers/recommendations';

export const advisorSteps: AzureIntegrationStep[] = [...recommendationSteps];
