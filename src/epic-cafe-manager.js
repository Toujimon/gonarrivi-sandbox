import React from "react";
import { StyledBox } from "./components/design-system";
import { Typography, List, ListItem, ListItemText } from "@material-ui/core";

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
    <StyledBox>
      <List>
        {games.map(game => (
          <ListItem key={game.id} divider>
            <ListItemText primary={game.name} />
          </ListItem>
        ))}
      </List>
    </StyledBox>
  );
}

function GamesCatalogContainer() {
  const [catalog, setCatalog] = React.useState(null);
  React.useEffect(() => {
    fetch("/api/catalog/1")
      .then(response => response.json().then(jsonData => jsonData))
      .catch(error => {
        console.log(error);
        return error;
      })
      .then(data => {
        setCatalog(data);
      });
  }, []);

  return catalog === null ? (
    "Loading catalog..."
  ) : (
    <GamesCatalog games={catalog} />
  );
}

/*-- UTILITY FUNCTIONS --*/
