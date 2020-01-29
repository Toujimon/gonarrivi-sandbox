import React from "react";
import { StyledBox } from "./components/design-system";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ListItemSecondaryAction,
  Button
} from "@material-ui/core";

export default function EpicCafeManager() {
  return (
    <React.Fragment>
      <Typography variant="h2">Epic Cafe Manager</Typography>
      <Typography variant="subtitle1">
        Management tools for the Epic Cafe game's catalog
      </Typography>
      <StyledBox>
        <Typography variant="h3">Catalog</Typography>
        <GamesCatalogContainer />
      </StyledBox>
    </React.Fragment>
  );
}

/*-- PRIVATE COMPONENTS --*/
/* To be refactored out if it seems like it may be useful on other modules */
function GamesCatalog({ games }) {
  return (
    <TableContainer component={StyledBox}>
      <Table>
        <TableBody>
          {games.map(game => (
            <TableRow key={game.id}>
              <TableCell vertical-align="top">{game.name}</TableCell>
              <TableCell vertical-align="top">
                {game.bggMatchId || "None"}
              </TableCell>
              <TableCell>
                {!!game.foundBggMatches.length && (
                  <List>
                    {game.foundBggMatches.map(match => {
                      const { id, name, yearpublished } = match;
                      return (
                        <ListItem key={id}>
                          <ListItemText
                            primary={
                              typeof name[0] === "string"
                                ? name[0]
                                : name[0]["_"]
                            }
                            secondary={
                              yearpublished
                                ? yearpublished[0]
                                : "Unknown release year"
                            }
                          />
                          <ListItemSecondaryAction>
                            <Button
                              onClick={() =>
                                window.open(
                                  `https://boardgamegeek.com/boardgame/${id}`
                                )
                              }
                            >
                              See BGG Entry
                            </Button>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function GamesCatalogContainer() {
  const [catalog, setCatalog] = React.useState(null);
  React.useEffect(() => {
    fetch("/api/catalog")
      .then(response => response.json().then(jsonData => jsonData))
      .catch(error => {
        console.log(error);
        return error;
      })
      .then(({ epicCatalog, bggCatalog, epicBggJoin }) => {
        setCatalog(
          epicCatalog.map(({ id, name }) => {
            return {
              id,
              name,
              bggMatchId: epicBggJoin[id].bggMatchId,
              foundBggMatches: epicBggJoin[id].foundBggMatches.map(
                matchId => bggCatalog[matchId]
              )
            };
          })
        );
      });
  }, []);

  return catalog === null ? (
    "Loading catalog information, may take a while..."
  ) : (
    <GamesCatalog games={catalog} />
  );
}

/*-- UTILITY FUNCTIONS --*/
