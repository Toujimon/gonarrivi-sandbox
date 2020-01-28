const path = require("path");

const outputDirectoryPath = path.resolve(__dirname, "output");

const getRawCatalogFilePath = version =>
  path.resolve(
    outputDirectoryPath,
    `raw_${version < 10 ? "0" : ""}${version}.txt`
  );
const getProcessedCatalogFilePath = version =>
  path.resolve(
    outputDirectoryPath,
    `catalog_${version < 10 ? "0" : ""}${version}.json`
  );

const bggMatchesFilePath = path.resolve(outputDirectoryPath, `bggMatches.json`);

module.exports = {
  outputDirectoryPath,
  getRawCatalogFilePath,
  getProcessedCatalogFilePath,
  bggMatchesFilePath
};
