const epicCafeUtils = require("./epicCafeUtils");
const bggApi = require("./bggApi");
const path = require("path");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const todaysFilesSuffix = `_${year}${[month, day]
  .map(x => `${x < 10 ? "0" : ""}${x}`)
  .join("")}`;
const outputDirectoryPath = path.resolve(__dirname, "output");
const todaysEpicCafeCatalogFileName = `epicgames${todaysFilesSuffix}.txt`;

function fetchAndProcess() {
  var epicGamesFilePath = path.resolve(
    outputDirectoryPath,
    todaysEpicCafeCatalogFileName
  );
  // epicCafeUtils.fetchEpicCafeCatalog(epicGamesFile);
  epicCafeUtils.fetchEpicCafeCatalog(epicGamesFilePath).then(created => {
    console.log(
      created
        ? `New file "${todaysEpicCafeCatalogFileName}" created with the fetched data`
        : `File "${todaysEpicCafeCatalogFileName}" already exists, so the process is done using it`
    );
    epicCafeUtils
      .processEpicCafeCatalog(
        epicGamesFilePath,
        outputDirectoryPath,
        todaysFilesSuffix
      )
      .then(() => console.log("Finished creating/updating processed files"));
  });
}

async function checkProcessedCatalog() {
  const processedFilePath = path.resolve(
    outputDirectoryPath,
    `catalog${todaysFilesSuffix}.json`
  );
  const data = await epicCafeUtils.parseProcessedCatalog(processedFilePath);
  console.log(`The processed catalog has ${data.length} entries`);
}

async function searchWithBggApi(searchTerm) {
  console.log(`searching "${searchTerm}"`);
  const results = await bggApi.search(searchTerm);
  console.log("results:", JSON.stringify(results, null, 2));
}

const [, , command, ...args] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess();
    break;
  }
  case "check": {
    checkProcessedCatalog();
    break;
  }
  case "search": {
    if (args.length) {
      const searchTerm = args.join(" ");
      searchWithBggApi(searchTerm);
    } else {
      console.log("should input some search words");
    }
    break;
  }
  default:
    console.log(`Unrecognized "${command}" command`);
}
