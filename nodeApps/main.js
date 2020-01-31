const epicCafeUtils = require("./epicCafeUtils");
const bggApi = require("./bggApi");
const fileUtils = require("./fileUtils");
const path = require("path");

const {
  outputDirectoryPath,
  processedCatalogFilePath,
  rawCatalogFilePath,
  bggMatchesFilePath,
  epicBggJoinPath,
  indexedBggCatalogPath
} = require("./shared");

function fetchAndProcess() {
  // epicCafeUtils.fetchEpicCafeCatalog(epicGamesFile);
  (!fileUtils.exists(rawCatalogFilePath)
    ? epicCafeUtils
        .fetchEpicCafeCatalog(rawCatalogFilePath)
        .then(text =>
          fileUtils
            .writeTextToFile(text, rawCatalogFilePath)
            .then(
              () =>
                console.log(`New raw file created with the fetched data`) ||
                text
            )
        )
    : console.log(
        `A raw file already exists, so the process is done using it`
      ) || fileUtils.readTextFromFile(rawCatalogFilePath)
  ).then(text =>
    epicCafeUtils
      .processEpicCafeCatalog(text)
      .then(([catalog]) =>
        fileUtils.writeJsonToFile(catalog, processedCatalogFilePath)
      )
      .then(() => console.log("Finished"))
  );
}

async function searchWithBggApi(searchTerm) {
  console.log(`searching "${searchTerm}"`);
  const results = await bggApi.search(searchTerm);
  console.log("results:", JSON.stringify(results, null, 2));
}

async function getBggMatches(amount = 2000) {
  if (!fileUtils.exists(processedCatalogFilePath)) {
    console.log(
      `No processed catalog exists. Be sure to retrieve it first with "process"`
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
          .replace(/¡|!|,|¿|\?|'|:|\(|\)|\+|´|-|&|\.|º|…|\*|\/|`/g, " ")
          .split(" ")
          .map(x => x.trim())
          .filter(x => x.length >= 2)
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

async function generateIndexes() {
  const indexedBggCatalog = {};
  const epicBggJoin = {};
  const epicCatalog = await fileUtils.readJsonFromFile(
    processedCatalogFilePath
  );
  const bggMatches = await fileUtils.readJsonFromFile(bggMatchesFilePath);
  for (const gameEntry of epicCatalog) {
    const entryBggMatches = bggMatches[gameEntry.id] || [];
    epicBggJoin[gameEntry.id] = {
      bggMatchId: null,
      foundBggMatches: entryBggMatches.map(x => x.id)
    };
    for (const bggMatch of entryBggMatches) {
      if (!indexedBggCatalog[bggMatch.id]) {
        indexedBggCatalog[bggMatch.id] = bggMatch;
      }
    }
  }
  await fileUtils.writeJsonToFile(indexedBggCatalog, indexedBggCatalogPath);
  await fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath);
  console.log("Finished");
}

async function confirmThosewithJustOneMatch(max = 1) {
  const [catalog, epicBggJoin] = await Promise.all([
    fileUtils.readJsonFromFile(processedCatalogFilePath),
    fileUtils.readJsonFromFile(epicBggJoinPath)
  ]);

  let count = 0;
  for (const entry of catalog) {
    const epicBggJoinEntry = epicBggJoin[entry.id];
    if (
      !epicBggJoinEntry.bggMatchId &&
      epicBggJoinEntry.foundBggMatches.length === 1
    ) {
      epicBggJoinEntry.bggMatchId = epicBggJoinEntry.foundBggMatches[0].id;
      epicBggJoinEntry.foundBggMatches = [];
      count++;
      if (count >= max) {
        break;
      }
    }
  }
  if (count) {
    await fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath);
    console.log(`Finished confirming ${count} entries`);
  } else {
    console.log("No entries to confirm found");
  }
}

async function cleanArleadyConfirmedFoundMatches() {
  const epicBggJoin = await fileUtils.readJsonFromFile(epicBggJoinPath);
  const [alreadyConfirmedIds, multipleMatchesEntries] = Object.values(
    epicBggJoin
  ).reduce(
    ([alreadyConfirmedIds, multipleMatchesEntries], epicBggJoinEntry) => {
      if (
        epicBggJoinEntry.bggMatchId &&
        !epicBggJoinEntry.foundBggMatches.length
      ) {
        alreadyConfirmedIds.add(epicBggJoinEntry.bggMatchId);
      } else if (epicBggJoinEntry.foundBggMatches.length > 1) {
        multipleMatchesEntries.push(epicBggJoinEntry);
      }
      return [alreadyConfirmedIds, multipleMatchesEntries];
    },
    [new Set(), []]
  );

  multipleMatchesEntries.forEach(epicBggJoinEntry => {
    epicBggJoinEntry.foundBggMatches = epicBggJoinEntry.foundBggMatches.filter(
      x => !alreadyConfirmedIds.has(x)
    );
  });

  await fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath);
  console.log("Finished");
}

const [, , command, ...args] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess();
    break;
  }
  case "special-chars": {
    fileUtils.readJsonFromFile(processedCatalogFilePath).then(catalog => {
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
    if (args.length > 0) {
      const amount = Number(args[0]);
      if (!isNaN(amount)) {
        getBggMatches(amount);
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
  case "generate-indexes": {
    generateIndexes();
    break;
  }
  case "batch-confirm": {
    confirmThosewithJustOneMatch(Number(args[0] || 1));
    break;
  }
  case "clear-confirmed": {
    cleanArleadyConfirmedFoundMatches();
    break;
  }
  case "search": {
    const searchTerm = args.join(" ");
    searchWithBggApi(searchTerm);
    break;
  }
  default:
    console.log(`Unrecognized "${command}" command`);
}
