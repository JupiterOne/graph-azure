// @ts-ignore
import markdownTable = require("markdown-table");
import Entities = require("../src/jupiterone");

const INTEGRATION_NAME = "Openshift";

interface Table {
  ENTITY: string[][];
  RELATIONSHIP: string[][];
}

const defaultTable: Table = {
  ENTITY: [
    [
      `${INTEGRATION_NAME}  Resource`,
      "_type of the Entity",
      "_class of the Entity",
    ],
  ],
  RELATIONSHIP: [["From", "Edge", "To"]],
};

function codeBlock(word: string): string {
  return `\`${word}\``;
}

function capitalize(word: string): string {
  return `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

function entityConstantFromType(entityType: string) {
  return [entityType.toUpperCase(), "ENTITY_TYPE"].join("_");
}

function generateEntityRow(typeKey: string, classKey: string): string[] {
  const providerName = typeKey
    .split("_")
    .slice(0, -2)
    .map(capitalize)
    .join(" ");
  const type: string = (Entities as any)[typeKey];
  const klass: string = (Entities as any)[classKey];

  return [providerName, codeBlock(type), codeBlock(klass)];
}

function generateRelationshipRow(typeKey: string, classKey: string): string[] {
  const type: string = (Entities as any)[typeKey];
  const klass: string = (Entities as any)[classKey];

  const components = type.split("_");
  const entities = components
    .slice(1)
    .map(capitalize)
    .join("")
    .split(
      klass
        .split("_")
        .map(capitalize)
        .join(""),
    );

  const parentEntityType: string = (Entities as any)[
    entityConstantFromType(entities[0])
  ];
  const childEntityType: string = (Entities as any)[
    entityConstantFromType(entities[1])
  ];

  return [
    codeBlock(parentEntityType),
    `**${klass}**`,
    codeBlock(childEntityType),
  ];
}

const tables = Object.keys(Entities).reduce((table: Table, key: string) => {
  const components = key.split("_");
  const tableName = components[components.length - 2];
  const isType = components[components.length - 1] === "TYPE";
  const classKey = [...components.slice(0, -1), "CLASS"].join("_");

  if (isType) {
    const row =
      tableName === "ENTITY"
        ? generateEntityRow(key, classKey)
        : generateRelationshipRow(key, classKey);
    return {
      ...table,
      // @ts-ignores
      [tableName]: [...table[tableName], row],
    };
  }

  return table;
}, defaultTable);

process.stdout.write("## Entities\n\n");
process.stdout.write(
  "The following entity resources are ingested when the integration runs:\n\n",
);
process.stdout.write(markdownTable(tables.ENTITY));

process.stdout.write("\n\n## Relationships\n\n");
process.stdout.write("The following relationships are created/mapped:\n\n");
process.stdout.write(markdownTable(tables.RELATIONSHIP));
process.stdout.write("\n\n");
