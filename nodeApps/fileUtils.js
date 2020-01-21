const fs = require("fs");

function exists(path) {
  return fs.existsSync(path);
}

function writeTextToFile(text, filePath) {
  return new Promise(resolve => {
    fs.writeFile(filePath, text, resolve);
  });
}

function readTextFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function writeJsonToFile(jsonObject, filePath) {
  return writeTextToFile(JSON.stringify(jsonObject, null, 2), filePath);
}

function readJsonFromFile(filePath) {
  return readTextFromFile(filePath).then(text => JSON.parse(text));
}

module.exports = {
  exists,
  writeTextToFile,
  readTextFromFile,
  writeJsonToFile,
  readJsonFromFile
};
