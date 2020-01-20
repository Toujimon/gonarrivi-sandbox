var epicCafeUtils = require("./epicCafeUtils");
const path = require("path");

const inputDirectoryPath = path.resolve(__dirname, "input");
const outputDirectoryPath = path.resolve(__dirname, "output");

var epicGamesFile = path.resolve(
  inputDirectoryPath,
  // `epicgames_${new Date().getTime()}.txt`
  `epicgames_1579552743600.txt`
);
// epicCafeUtils.fetchEpicCafeCatalog(epicGamesFile);
epicCafeUtils.readCatalogFile(epicGamesFile, outputDirectoryPath)
