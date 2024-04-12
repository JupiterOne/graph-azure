import { IntegrationConfig } from '../../../../types';
import { v4 as uuid } from 'uuid';

export function getConfigForTest(config: IntegrationConfig): IntegrationConfig {
  // The Azure Subscription Client has some validation before sending requests to
  // this endpoint that requires "subscriptionId" to be a UUID.
  //
  // When running tests in CI, we set the value of `config.subscriptionId` to "subscriptionId",
  // causing the Azure SDK to throw the following:
  //
  // "subscriptionId" with value "subscriptionId" should satisfy the constraint
  // "Pattern": /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/.

  const subscriptionIdValidationRegex =
    /^[0-9A-Fa-f]{8}-([0-9A-Fa-f]{4}-){3}[0-9A-Fa-f]{12}$/;
  return {
    ...config,
    subscriptionId: subscriptionIdValidationRegex.test(
      config.subscriptionId || '',
    )
      ? config.subscriptionId
      : uuid(),
  };
}
