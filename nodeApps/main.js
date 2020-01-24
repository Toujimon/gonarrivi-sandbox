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
const bggMatchesFilePath = path.resolve(outputDirectoryPath, `bggMatches.json`);

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

async function searchWithBggApi(searchTerm) {
  console.log(`searching "${searchTerm}"`);
  const results = await bggApi.search(searchTerm);
  console.log("results:", JSON.stringify(results, null, 2));
}

async function getBggMatches(version, amount) {
  const processedCatalogFilePath = getProcessedCatalogFilePath(version);
  if (!fileUtils.exists(processedCatalogFilePath)) {
    console.log(
      `No processed catalog for version "${version}" exists. Be sure to retrieve it first with "process ${version}"`
    );
  } else {
    const catalog = await fileUtils.readJsonFromFile(processedCatalogFilePath);
    if (!fileUtils.exists(bggMatchesFilePath)) {
      await fileUtils.writeJsonToFile({}, bggMatchesFilePath);
    }
    const bggMatches = await fileUtils.readJsonFromFile(bggMatchesFilePath);
    let searchedElements = 0;
    for (const entry of catalog) {
      if (!bggMatches[entry.id]) {
        searchedElements++;
        const searchTerm = entry.name
          .replace(/¡|!|,|¿|\?|'|:|\(|\)|\+|´|-|&|\.º|…|\*|\/|`/g, " ")
          .split(" ")
          .map(x => x.trim())
          .filter(x => x.length >= 3)
          .join(" ");
        console.log(`[${searchedElements}] Searching for "${searchTerm}"`);
        await bggApi.search(searchTerm).then(matches =>
          Promise.all([
            new Promise(res => {
              /* The bggMatches object gets updated and saved while waiting some 
              seconds before the next request */
              bggMatches[entry.id] = matches;
              res(fileUtils.writeJsonToFile(bggMatches, bggMatchesFilePath));
            }),
            new Promise(res => setTimeout(res, 5000))
          ])
        );
      }
      if (searchedElements >= amount) break;
    }
    console.log(`Finished ${searchedElements} elements`);
  }
}

async function checkBggMatches() {
  if (fileUtils.exists(bggMatchesFilePath)) {
    const bggMatches = await fileUtils.readJsonFromFile(bggMatchesFilePath);
    let oneMatch = 0,
      zeroMatches = 0,
      multipleMatches = 0;
    const allMatchesCollection = Object.values(bggMatches);
    if (allMatchesCollection.length) {
      for (const matches of allMatchesCollection) {
        if (!matches.length) zeroMatches++;
        else if (matches.length === 1) oneMatch++;
        else multipleMatches++;
      }
      const allMatches = allMatchesCollection.length;
      console.log(`Game entries (${allMatches}):
- Zero matches: ${zeroMatches}/${allMatches} (${Math.round(
        (zeroMatches / allMatches) * 100
      )}%)
- One match: ${oneMatch}/${allMatches} (${Math.round(
        (oneMatch / allMatches) * 100
      )}%)
- Multiple matches: ${multipleMatches}/${allMatches} (${Math.round(
        (multipleMatches / allMatches) * 100
      )}%)`);
    } else {
      console.log("No game entries found on the BGG Matches files");
    }
  } else {
    console.log("No BGG matches file found");
  }
}

const [, , command, version, ...args] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess(Number(version || 1));
    break;
  }
  case "special-chars": {
    fileUtils
      .readJsonFromFile(getProcessedCatalogFilePath(version))
      .then(catalog => {
        const specialCharactersSet = new Set();
        for (const entry of catalog) {
          console.log(entry.name);
          const specialCharacters = [...(entry.name.match(/\W/g) || [])];
          for (const character of specialCharacters) {
            specialCharactersSet.add(character);
          }
        }
        fileUtils
          .writeTextToFile(
            [...specialCharactersSet].join(""),
            path.resolve(outputDirectoryPath, "special.txt")
          )
          .then(() => console.log("Finished"));
      });

    break;
  }
  case "get-bgg-matches": {
    if (version && args.length > 0) {
      const amount = Number(args[0]);
      if (!isNaN(amount)) {
        getBggMatches(version, amount);
      }
    } else {
      console.log(
        "A version and amount of registers to check have to be specified"
      );
    }
    break;
  }
  case "check-bgg-matches": {
    checkBggMatches();
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
