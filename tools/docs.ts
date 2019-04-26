import fs from "fs-extra";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const packageNameSansOrg = pkg.name.split("/").pop();
const baseDocsPath = `docs/jupiterone-io/${packageNameSansOrg}`;

let docsExtension;
if (fs.pathExistsSync(`${baseDocsPath}.md`)) {
  docsExtension = "md";
} else if (fs.pathExistsSync(`${baseDocsPath}.rst`)) {
  docsExtension = "rst";
}

if (docsExtension !== undefined) {
  fs.copySync(
    `${baseDocsPath}.${docsExtension}`,
    `dist/docs/${packageNameSansOrg}.${docsExtension}`,
  );
  fs.writeFileSync(
    "dist/docs/metadata.json",
    JSON.stringify(
      {
        version: pkg.version,
      },
      null,
      2,
    ),
  );
} else {
  throw new Error("No documentation found!");
}
