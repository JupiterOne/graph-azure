import { createCommand } from 'commander';

import { documentDiagnosticSettings } from './commands/documentDiagnosticSettings';

export function createCli() {
  return createCommand().addCommand(documentDiagnosticSettings());
}
