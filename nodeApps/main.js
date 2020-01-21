const epicCafeUtils = require("./epicCafeUtils");
const bggApi = require("./bggApi");
const fileUtils = require("./fileUtils");
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

function fetchAndProcess(version) {
  var rawCatalogFilePath = getRawCatalogFilePath(version);
  // epicCafeUtils.fetchEpicCafeCatalog(epicGamesFile);
  (!fileUtils.exists(rawCatalogFilePath)
    ? epicCafeUtils
        .fetchEpicCafeCatalog(rawCatalogFilePath)
        .then(text =>
          fileUtils
            .writeTextToFile(text, rawCatalogFilePath)
            .then(
              () =>
                console.log(
                  `New file for version "${version}" created with the fetched data`
                ) || text
            )
        )
    : console.log(
        `File for version "${version}" already exists, so the process is done using it`
      ) || fileUtils.readTextFromFile(rawCatalogFilePath)
  ).then(text =>
    epicCafeUtils
      .processEpicCafeCatalog(text)
      .then(([catalog]) =>
        fileUtils.writeJsonToFile(catalog, getProcessedCatalogFilePath(version))
      )
      .then(() => console.log("Finished"))
  );
}

async function checkProcessedCatalog() {
  const indexedCatalogFilePath = path.resolve(
    outputDirectoryPath,
    `indexedCatalog.json`
  );

  if (!fileUtils.exists(indexedCatalogFilePath)) {
    await fileUtils.writeJsonToFile({}, indexedCatalogFilePath);
  }

  const indexedCatalog = await fileUtils.readJsonFromFile(
    indexedCatalogFilePath
  );
  console.log(
    `The processed catalog has ${Object.keys(indexedCatalog).length} entries`
  );
}

async function searchWithBggApi(searchTerm) {
  console.log(`searching "${searchTerm}"`);
  const results = await bggApi.search(searchTerm);
  console.log("results:", JSON.stringify(results, null, 2));
}

const [, , command, version, ...args] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess(Number(version || 1));
    break;
  }
  case "check": {
    checkProcessedCatalog();
    break;
  }
  case "search": {
    if (args.length) {
      const searchTerm = [version, ...args].join(" ");
      searchWithBggApi(searchTerm);
    } else {
      console.log("should input some search words");
    }
    break;
  }
  default:
    console.log(`Unrecognized "${command}" command`);
}
