const path = require("path");

const outputDirectoryPath = path.resolve(__dirname, "assets");

const rawCatalogFilePath = path.resolve(outputDirectoryPath, `raw.txt`);

const processedCatalogFilePath = path.resolve(
  outputDirectoryPath,
  `catalog.json`
);

const bggMatchesFilePath = path.resolve(outputDirectoryPath, `bggMatches.json`);

const indexedBggCatalogPath = path.resolve(
  outputDirectoryPath,
  `indexedBggCatalog.json`
);

const epicBggJoinPath = path.resolve(outputDirectoryPath, `epicBggJoined.json`);

module.exports = {
  outputDirectoryPath,
  rawCatalogFilePath,
  processedCatalogFilePath,
  bggMatchesFilePath,
  indexedBggCatalogPath,
  epicBggJoinPath
};
