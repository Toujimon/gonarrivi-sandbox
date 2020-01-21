const epicCafeUtils = require("./epicCafeUtils");
const path = require("path");

function fetchAndProcess() {
  const inputDirectoryPath = path.resolve(__dirname, "input");
  const outputDirectoryPath = path.resolve(__dirname, "output");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const newFileName = `epicgames_${year}${[month, day]
    .map(x => `${x < 10 ? "0" : ""}${x}`)
    .join("")}.txt`;
  var epicGamesFilePath = path.resolve(inputDirectoryPath, newFileName);
  // epicCafeUtils.fetchEpicCafeCatalog(epicGamesFile);
  epicCafeUtils.fetchEpicCafeCatalog(epicGamesFilePath).then(created => {
    console.log(
      created
        ? `New file "${newFileName}" created with the fetched data`
        : `File "${newFileName}" already exists, so the process is done using it`
    );
    epicCafeUtils.parseEpicCafeCatalog(epicGamesFilePath, outputDirectoryPath);
  });
}

const [, , command] = process.argv;
switch (command) {
  case "process": {
    fetchAndProcess();
    break;
  }
  default:
    console.log(`Unrecognized "${command}" command`);
}
