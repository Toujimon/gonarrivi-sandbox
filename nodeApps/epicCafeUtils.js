var Browser = require("zombie");
var https = require("https");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function fetchEpicCafeCatalog(outputFilePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputFilePath)) {
      const browser = new Browser();
      browser.visit("https://www.epicmadrid.com/nuestrosjuegos", () => {
        var dataSource = browser
          .queryAll("iframe")
          .map(x => x.getAttribute("data-src"))
          .find(x => x.indexOf("wix-visual-data.appspot.com") >= 0);

        const [, queryString] = dataSource.split("?");
        const queryStringEntries = queryString
          .split("&")
          .map(x => x.split("="))
          .filter(([name]) => name === "compId" || name === "instance");
        const url =
          "https://wix-visual-data.appspot.com/app/file" +
          "?" +
          queryStringEntries.map(entry => entry.join("=")).join("&");
        https.get(url, res => {
          res.setEncoding("utf-8");
          res
            .pipe(fs.createWriteStream(outputFilePath))
            .on("close", () => resolve(true));
          res.on("error", error => reject(error));
        });
      });
    } else {
      resolve(false);
    }
  });
}

function processEpicCafeCatalog(
  inputFilePath,
  outputDirectoryPath,
  filesSuffix = ""
) {
  const gameEntryKeys = ["name", "coordinates", "quantity", "players", "age"];
  const catalog = [];
  const keyValuesSets = gameEntryKeys.reduce(
    (acc, key) => ({ ...acc, [key]: new Set() }),
    {}
  );
  let processLine = () => {
    processLine = gameEntryLine => {
      const gameEntryValues = [];
      let currentEntry = [];
      let isEscapingSeparators = false;
      const SEPARATOR = ",";
      const ESCAPE_CHARACTER = '"';
      for (let character of gameEntryLine) {
        if (character === ESCAPE_CHARACTER) {
          isEscapingSeparators = !isEscapingSeparators;
        } else if (character === SEPARATOR && !isEscapingSeparators) {
          gameEntryValues.push(currentEntry.join(""));
          currentEntry = [];
        } else {
          currentEntry.push(character);
        }
      }
      gameEntryValues.push(currentEntry.join(""));
      let gameEntry = { raw: gameEntryLine };
      gameEntryKeys.forEach((key, index) => {
        const value = gameEntryValues[index];
        keyValuesSets[key].add(value);
        gameEntry[key] = (() => {
          switch (key) {
            case "players": {
              const [, minString = "", , maxString = ""] =
                /(\d+)(\D*(\d*))$/.exec(value) || [];
              return {
                type:
                  minString && maxString ? "range" : minString ? "min" : value,
                min: Number(minString),
                max: Number(maxString)
              };
            }
            case "age": {
              const [min = ""] = /\d+/.exec(value) || [];
              return Number(min);
            }
            case "quantity": {
              const quantity = Number(value);
              return isNaN(quantity) ? 0 : quantity;
            }
            default:
              return value;
          }
        })();
      });
      gameEntry.id = gameEntry.name
      gameEntry.idType = "epic"
      catalog.push(gameEntry);
    };
  };
  return new Promise((resolve, reject) => {
    readline
      .createInterface(fs.createReadStream(inputFilePath))
      .on("line", line => processLine(line))
      .on("close", () => {
        resolve(
          Promise.all([
            new Promise(resolve =>
              fs.writeFile(
                path.resolve(outputDirectoryPath, `catalog${filesSuffix}.json`),
                JSON.stringify(catalog, null, 2),
                resolve
              )
            ),
            ...gameEntryKeys.map(
              key =>
                new Promise(resolve =>
                  fs.writeFile(
                    path.resolve(
                      outputDirectoryPath,
                      `set_${key}${filesSuffix}.txt`
                    ),
                    [...keyValuesSets[key]].join("\n"),
                    resolve
                  )
                )
            )
          ])
        );
      });
  });
}

function parseProcessedCatalog(inputFilePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFilePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

module.exports = {
  fetchEpicCafeCatalog,
  processEpicCafeCatalog,
  parseProcessedCatalog
};
