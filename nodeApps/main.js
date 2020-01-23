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
const indexedCatalogFilePath = path.resolve(
  outputDirectoryPath,
  `indexedCatalog.json`
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

async function checkIndexedMetadata() {
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

async function getIndexedMetadata(version, amount) {
  const processedCatalogFilePath = getProcessedCatalogFilePath(version);
  if (!fileUtils.exists(processedCatalogFilePath)) {
    console.log(
      `No processed catalog for version "${version}" exists. Be sure to retrieve it first with "process ${version}"`
    );
  } else if (!fileUtils.exists(indexedCatalogFilePath)) {
    console.log(
      `No indexed catalog file exists. Be sure to generate it first with "check"`
    );
  } else {
    const catalog = await fileUtils.readJsonFromFile(processedCatalogFilePath);
    const indexedCatalog = await fileUtils.readJsonFromFile(indexedCatalogFilePath);
    let searchedElements = 0;
    for (const entry of catalog) {
      if (!indexedCatalog[entry.id]) {
        searchedElements++;
        const searchTerm = entry.name
          .replace(/\W+/g, " ")
          .trim()
          .split(" ")
          .filter(x => x.length >= 3)
          .join(" ");
        console.log(`Searching for "${searchTerm}"`);
        const metadata = await bggApi
          .search(searchTerm)
          .then(
            response =>
              new Promise(res => setTimeout(() => res(response), 5000))
          );
        indexedCatalog[entry.id] = metadata;
      }
      if (searchedElements >= amount) break;
    }
    await fileUtils.writeJsonToFile(indexedCatalog, indexedCatalogFilePath);
    console.log(`finished searching ${searchedElements} elements`);
  }
}

const [, , command, version, ...args] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess(Number(version || 1));
    break;
  }
  case "check": {
    checkIndexedMetadata();
    break;
  }
  case "get-metadata": {
    if (version && args.length > 0) {
      const amount = Number(args[0]);
      if (!isNaN(amount)) {
        getIndexedMetadata(version, amount);
      }
    } else {
      console.log(
        "A version and amount of registers to check have to be specified"
      );
    }
    break;
  }
  case "search": {
    if (version) {
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
