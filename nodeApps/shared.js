const path = require('path')

const outputDirectoryPath = path.resolve(__dirname, 'assets')

function getOutputFilePath(filename) {
  return path.resolve(outputDirectoryPath, filename)
}

const rawCatalogFilePath = path.resolve(outputDirectoryPath, `raw.txt`)

const processedCatalogFilePath = path.resolve(
  outputDirectoryPath,
  `catalog.json`
)

const bggMatchesFilePath = path.resolve(outputDirectoryPath, `bggMatches.json`)

const indexedBggCatalogPath = path.resolve(
  outputDirectoryPath,
  `indexedBggCatalog.json`
)

const indexedExtendedBggCatalogPath = path.resolve(
  outputDirectoryPath,
  `indexedExtendedBggCatalog.json`
)

const epicBggJoinPath = path.resolve(outputDirectoryPath, `epicBggJoined.json`)

module.exports = {
  getOutputFilePath,
  outputDirectoryPath,
  rawCatalogFilePath,
  processedCatalogFilePath,
  bggMatchesFilePath,
  indexedBggCatalogPath,
  indexedExtendedBggCatalogPath,
  epicBggJoinPath
}
