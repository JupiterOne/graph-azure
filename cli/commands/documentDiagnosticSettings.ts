import * as log from '../log';
import * as path from 'path';
import { createCommand } from 'commander';
import { StepRelationshipMetadata } from '@jupiterone/integration-sdk-core';
import { promises as fs } from 'fs';
import { MonitorRelationships } from '../../src/steps/resource-manager/monitor/constants';
import { loadConfig } from '../config';

const J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_START =
  '<!-- {J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_START} -->';
const J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END =
  '<!-- {J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END} -->';

interface DocumentCommandArgs {
  projectPath: string;
  outputFile: string;
}

export function documentDiagnosticSettings() {
  return createCommand('document-diagnostic-settings')
    .description(
      'Generates documentation for Azure entities that have diagnostic settings',
    )
    .option(
      '-p, --project-path <directory>',
      'Absolute path to the integration project directory. Defaults to the current working directory.',
      process.cwd(),
    )
    .option(
      '-o, --output-file <path>',
      'Absolute path to the Markdown file that should be created/updated. Defaults to {CWD}/docs/jupiterone.md.',
    )
    .action(executeDocumentAction);
}

async function executeDocumentAction(
  options: DocumentCommandArgs,
): Promise<void> {
  const { projectPath } = options;
  const documentationFilePath =
    options.outputFile || getDefaultDocumentationFilePath(projectPath);

  log.info('\nCollecting metadata types from steps...\n');
  const { integrationSteps } = await loadConfig(path.join(projectPath, 'src'));

  const diagnosticSettingsRelationships: StepRelationshipMetadata[] = [];

  for (const step of integrationSteps) {
    for (const relationship of step.relationships) {
      if (
        relationship._type ===
        MonitorRelationships.AZURE_RESOURCE_HAS_DIAGNOSTIC_SETTING._type
      ) {
        diagnosticSettingsRelationships.push(relationship);
      }
    }
  }

  log.info(
    `\nAttempting to load existing documentation file (path=${documentationFilePath})!\n`,
  );
  const oldDocumentationFile = await getDocumentationFile(
    documentationFilePath,
  );
  log.info('\nExisting documentation file successfully loaded!\n');

  const newGeneratedDocumentationSection = generateDiagnosticSettingsDocumentationFromMetadata(
    diagnosticSettingsRelationships,
  );

  log.info('\nGenerated integration documentation section:');
  log.info('---------------------------------------------\n');
  log.info(newGeneratedDocumentationSection);

  const newDocumentationFile = replaceBetweenDocumentMarkers(
    oldDocumentationFile,
    newGeneratedDocumentationSection,
  );

  log.info('Attempting to write new documentation...');

  await fs.writeFile(documentationFilePath, newDocumentationFile, {
    encoding: 'utf-8',
  });

  log.info('Successfully generated documentation!');
}

async function getDocumentationFile(
  documentationFilePath: string,
): Promise<string> {
  try {
    const file = await fs.readFile(documentationFilePath, {
      encoding: 'utf-8',
    });
    return file;
  } catch (err) {
    log.error(
      `Error loading documentation file from path (path=${documentationFilePath}, err=${err.message})`,
    );
    throw err;
  }
}

function getDefaultDocumentationFilePath(
  projectSourceDirectory: string,
): string {
  return path.join(projectSourceDirectory, 'docs/jupiterone.md');
}

function generateDiagnosticSettingsDocumentationFromMetadata(
  diagnosticSettingsRelationshipMetadata: (StepRelationshipMetadata & {
    resourceType?: string;
    logCategories?: string[];
  })[],
): string {
  const diagnosticSettingsMetadata: {
    resourceType: string;
    logCategories: string[] | undefined;
  }[] = [];

  for (const relationshipMetadata of diagnosticSettingsRelationshipMetadata) {
    if (relationshipMetadata.resourceType) {
      diagnosticSettingsMetadata.push({
        resourceType: relationshipMetadata.resourceType,
        logCategories: relationshipMetadata.logCategories,
      });
    }
  }

  let diagnosticSettingsListSection = '';
  for (const metadata of sortDiagnosticSettingsMetadata(
    diagnosticSettingsMetadata,
  )) {
    diagnosticSettingsListSection += `- ${metadata.resourceType}\n`;
    if (metadata.logCategories) {
      diagnosticSettingsListSection += `  - Log Categories:\n`;
      for (const category of metadata.logCategories) {
        diagnosticSettingsListSection += `    - ${category}\n`;
      }
    }
  }

  return `${J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_START}
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-azure-integration document-diagnostic-settings" COMMAND. DO NOT EDIT BY HAND!
********************************************************************************
-->

## Diagnostic Settings

Azure Diagnostic Settings are supported on many Azure resources. A list of
supported services / metrics can be found in
[Azure documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/essentials/metrics-supported).

The JupiterOne graph-azure project currently ingests diagnostic settings for the
following entities:

${diagnosticSettingsListSection}
<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
${J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END}`;
}

function sortDiagnosticSettingsMetadata(
  diagnosticSettingsMetadata: {
    resourceType: string;
    logCategories?: string[];
  }[],
) {
  return diagnosticSettingsMetadata.sort((a, b) =>
    a.resourceType > b.resourceType ? 1 : -1,
  );
}

function replaceBetweenDocumentMarkers(
  oldDocumentationFile: string,
  newGeneratedDocumentationSection: string,
): string {
  const startIndex = oldDocumentationFile.indexOf(
    J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_START,
  );

  if (startIndex === -1) {
    return oldDocumentationFile + '\n\n' + newGeneratedDocumentationSection;
  }

  const endIndex = oldDocumentationFile.indexOf(
    J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END,
  );

  if (endIndex === -1) {
    throw new Error(
      'Could not generate documentation. Documentation starter marker found, but ending marker not found!',
    );
  }

  return (
    oldDocumentationFile.substring(0, startIndex) +
    newGeneratedDocumentationSection +
    oldDocumentationFile.substring(
      // This should never happen, but we should handle the case where there is
      // a start marker, but not an end marker.
      endIndex + J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END.length,
    )
  );
}
