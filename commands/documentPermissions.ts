/* eslint-disable no-console */
import { promises as fs } from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { invocationConfig } from '../src';
import { AzureIntegrationStep } from '../src/types';
import chalk from 'chalk';

const table = require('markdown-table');

const documentPermissionsCommand = new Command();

interface DocumentCommandArgs {
  outputFile: string;
}

const J1_PERMISSIONS_DOCUMENTATION_MARKER_START =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_START} -->';
const J1_PERMISSIONS_DOCUMENTATION_MARKER_END =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_END} -->';
const J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_START =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_START} -->';
const J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_START =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_START} -->';
const J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_END =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_END} -->';
const J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_END =
  '<!-- {J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_END} -->';
documentPermissionsCommand
  .command('documentPermissions')
  .description('Generate GCP permissions list')
  .option(
    '-o, --output-file <path>',
    'project relative path to generated Markdown file',
    path.join('docs', 'jupiterone.md'),
  )
  .action(executeDocumentPermissionsAction);

documentPermissionsCommand.parse();

async function executeDocumentPermissionsAction(options: DocumentCommandArgs) {
  const { outputFile } = options;
  console.log(
    chalk.gray(
      'DOCUMENT PERMISSIONS (START): Collecting permissions from steps...',
    ),
  );

  const documentationFilePath = path.join(process.cwd(), outputFile);
  const oldDocumentationFile = await getDocumentationFile(
    documentationFilePath,
  );

  if (!oldDocumentationFile) {
    return;
  }

  const newGeneratedDocumentationSection = getNewDocumentationVersion();

  console.log(chalk.gray(newGeneratedDocumentationSection));

  if (!newGeneratedDocumentationSection) return;

  const newDocumentationFile = replaceBetweenDocumentMarkers(
    oldDocumentationFile,
    newGeneratedDocumentationSection,
  );

  try {
    await fs.writeFile(documentationFilePath, newDocumentationFile, {
      encoding: 'utf-8',
    });
  } catch (error) {
    console.log(
      chalk.gray(
        `Unable to write documentation file from path ${documentationFilePath}.`,
      ),
    );
  }

  console.log(
    chalk.gray(
      `DOCUMENT PERMISSIONS (END): Finished document permissions process.`,
    ),
  );
}

function getDocumentationFile(documentationFilePath: string) {
  try {
    chalk.gray(`Reading documentation file from ${documentationFilePath}`);
    return fs.readFile(documentationFilePath, {
      encoding: 'utf-8',
    });
  } catch (error) {
    console.log(
      chalk.gray(
        `Unable to read documentation file from path ${documentationFilePath}. Aborting`,
      ),
    );
  }
}

function getNewDocumentationVersion(): string | undefined {
  const { integrationSteps } = invocationConfig;
  const rolePermissionSet = new Set<string>();
  const apiPermissionSet = new Set<string>();
  integrationSteps.forEach((step: AzureIntegrationStep) => {
    if (step.rolePermissions) {
      step.rolePermissions.forEach(rolePermissionSet.add, rolePermissionSet);
    }
    if (step.apiPermissions) {
      step.apiPermissions.forEach(apiPermissionSet.add, apiPermissionSet);
    }
  });
  const rolePermissionList = Array.from(rolePermissionSet.values());
  const apiPermissionList = Array.from(apiPermissionSet.values());
  rolePermissionList.sort((a: string, b: string) => a.localeCompare(b));
  apiPermissionList.sort((a: string, b: string) => a.localeCompare(b));
  const apiTableMarkdown = getTableMarkdown(
    apiPermissionList,
    `API Permissions List (${apiPermissionList.length})`,
  );
  const roleTableMarkdown = getTableMarkdown(
    rolePermissionList,
    `Role Permissions List (${rolePermissionList.length})`,
  );

  return `${J1_PERMISSIONS_DOCUMENTATION_MARKER_START}\n${J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_START}\n${roleTableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_END}\n${J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_START}\n${apiTableMarkdown}\n${J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_END}\n${J1_PERMISSIONS_DOCUMENTATION_MARKER_END}`;
}

function getTableMarkdown(
  permissionsList: string[],
  tableTitle?: string,
): string {
  return table([
    [tableTitle ? tableTitle : 'Permissions List'],
    ...permissionsList.map((permission) => [`\`${permission}\``]),
  ]);
}

function replaceBetweenDocumentMarkers(
  oldDocumentationFile: string,
  newGeneratedDocumentationSection: string,
): string {
  const startIndex = oldDocumentationFile.indexOf(
    J1_PERMISSIONS_DOCUMENTATION_MARKER_START,
  );

  if (startIndex === -1) {
    return `${oldDocumentationFile}\n\n${newGeneratedDocumentationSection}`;
  }

  const endIndex = oldDocumentationFile.indexOf(
    J1_PERMISSIONS_DOCUMENTATION_MARKER_END,
  );

  return (
    oldDocumentationFile.substring(0, startIndex) +
    newGeneratedDocumentationSection +
    oldDocumentationFile.substring(
      endIndex + J1_PERMISSIONS_DOCUMENTATION_MARKER_END.length,
    )
  );
}
