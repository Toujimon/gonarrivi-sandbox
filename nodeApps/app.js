const express = require("express");
const fileUtils = require("./fileUtils");
const {
  processedCatalogFilePath,
  indexedBggCatalogPath,
  epicBggJoinPath
} = require("./shared");

const port = 4000;
const app = express();
app.use(express.json());

app.get("/api/catalog", (req, res) => {
  getAllData().then(([epicCatalog, bggCatalog, epicBggJoin]) => {
    res.send({ epicCatalog, bggCatalog, epicBggJoin });
  });
});

app.put("/api/catalog", (req, res) => {
  console.log(`PUT catalog entry match`, req.body);
  const { id, bggMatchId } = req.body;
  if (id && bggMatchId) {
    getAllData().then(([, bggCatalog, epicBggJoin]) => {
      if (epicBggJoin[id] && bggCatalog[bggMatchId]) {
        epicBggJoin[id].bggMatchId = bggMatchId;
        fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath).then(() => {
          res.sendStatus(200);
        });
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(500);
  }
});

app.delete("/api/catalog", (req, res) => {
  console.log(`DELETE catalog entry matches`, req.body);
  const { id } = req.body;
  if (id) {
    getAllData().then(([, , epicBggJoin]) => {
      const epicBggJoinEntry = epicBggJoin[id];
      if (epicBggJoinEntry) {
        if (epicBggJoinEntry.bggMatchId) {
          epicBggJoin[id].foundBggMatches = [];
          fileUtils.writeJsonToFile(epicBggJoin, epicBggJoinPath).then(() => {
            res.sendStatus(200);
          });
        } else {
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(500);
  }
});

app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

/*-- UTILITY FUNCTIONS --*/
function getAllData() {
  return Promise.all([
    fileUtils.readJsonFromFile(processedCatalogFilePath),
    fileUtils.readJsonFromFile(indexedBggCatalogPath),
    fileUtils.readJsonFromFile(epicBggJoinPath)
  ]);
}
