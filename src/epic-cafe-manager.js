import React from "react";
import { StyledBox } from "./components/design-system";
import {
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Grid,
  Toolbar,
  Select,
  Button,
  IconButton,
  TablePagination,
  Checkbox,
  FormControlLabel
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSadTear, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function EpicCafeManager() {
  return (
    <React.Fragment>
      <Typography variant="h2">Epic Cafe Manager</Typography>
      <Typography variant="subtitle1">
        Management tools for the Epic Cafe game's catalog
      </Typography>
      <StyledBox>
        <Typography variant="h3">Board Game Geek matcher tool</Typography>
        <Typography variant="subtitle2">
          A tool to properly match the diferent entries of the Epic Cafe catalog
          to the well known Board Game Geek database entries, so extra meta-data
          about the different games can be retrieved.
        </Typography>
        <EpicBggMatcherContainer />
      </StyledBox>
    </React.Fragment>
  );
}

/*-- PRIVATE COMPONENTS --*/
/* To be refactored out if it seems like it may be useful on other modules */

function EpicBggMatcherContainer() {
  const [[catalog, mustFetch], setState] = React.useState([null, true]);
  function setCatalog(catalog) {
    setState([catalog, false]);
  }
  function refetchCatalog() {
    setState([catalog, true]);
  }
  React.useEffect(() => {
    if (mustFetch) {
      fetch("/api/catalog")
        .then(response => response.json().then(jsonData => jsonData))
        .catch(error => {
          console.log(error);
          return error;
        })
        .then(({ epicCatalog, bggCatalog, epicBggJoin }) => {
          const catalog = epicCatalog.map(
            ({ id, name, players, age, coordinates }) => {
              return {
                id,
                name,
                players:
                  players.type === "range" || players.type === "min"
                    ? `${players.min} - ${players.max || ""}`
                    : players.type,
                age,
                coordinates,
                bggMatchId: epicBggJoin[id].bggMatchId,
                foundBggMatches: epicBggJoin[id].foundBggMatches.map(
                  matchId => bggCatalog[matchId]
                )
              };
            }
          );
          setCatalog(catalog);
        });
    }
  }, [mustFetch]);

  function handleEpicBggMatchConfirm(id, bggMatchId) {
    fetch("/api/catalog", {
      method: "put",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id, bggMatchId })
    }).then(res => {
      if (res.status === 200) {
        refetchCatalog();
      } else {
        console.error("Error while trying to update data:", res.statusText);
      }
    });
  }

  function handleEpicBggMatchesClean(id) {
    fetch("/api/catalog", {
      method: "delete",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    }).then(res => {
      if (res.status === 200) {
        refetchCatalog();
      } else {
        console.error("Error while trying to clean matches:", res.statusText);
      }
    });
  }

  return catalog === null ? (
    "Loading catalog information, may take a while..."
  ) : (
    <EpicBggMatcher
      games={catalog}
      onEpicBggMatchConfirm={handleEpicBggMatchConfirm}
      onEpicBggMatchesClean={handleEpicBggMatchesClean}
    />
  );
}

const PAGE_SIZE = 25;
const FILTERS = [
  ["All", null],
  ["No matches", x => !x.foundBggMatches.length],
  ["Just one match", x => x.foundBggMatches.length === 1],
  ["Multiple matches", x => x.foundBggMatches.length > 1]
];

function EpicBggMatcher({
  games,
  onEpicBggMatchConfirm,
  onEpicBggMatchesClean
}) {
  const [
    [page, appliedFilterIndex, hideConfirmedMatches],
    setState
  ] = React.useState([0, 0, true]);
  const setPage = page =>
    setState([page, appliedFilterIndex, hideConfirmedMatches]);
  const setAppliedFilterIndex = appliedFilterIndex =>
    setState([0, appliedFilterIndex, hideConfirmedMatches]);

  const [, appliedFilter = null] = FILTERS[appliedFilterIndex] || [];

  const [displayedGames, filteredGamesCount] = React.useMemo(() => {
    const filteredGames = (!appliedFilter
      ? games
      : games.filter(appliedFilter)
    ).filter(
      !hideConfirmedMatches
        ? x => x
        : x => !x.bggMatchId || x.foundBggMatches.length
    );
    const displayedGames = filteredGames.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE
    );
    return [displayedGames, filteredGames.length];
  }, [games, page, appliedFilter, hideConfirmedMatches]);

  React.useEffect(() => {
    if (page > 0 && !displayedGames.length) {
      setPage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedGames, page]);

  return (
    <TableContainer component={StyledBox}>
      <Grid container>
        <Grid item md={8}>
          <Toolbar>
            <Select
              value={appliedFilterIndex}
              native
              onChange={event =>
                setAppliedFilterIndex(Number(event.currentTarget.value))
              }
            >
              {FILTERS.map(([text], index) => (
                <option key={index} value={index}>
                  {text}
                </option>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideConfirmedMatches}
                  onChange={event =>
                    setState(([, , prevValue]) => [
                      page,
                      appliedFilterIndex,
                      !prevValue
                    ])
                  }
                />
              }
              label="Hide confirmed matches"
            />
          </Toolbar>
        </Grid>
        <Grid item md={4} xs={12}>
          <TablePagination
            component="div"
            count={filteredGamesCount}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            page={page}
            onChangePage={(event, newPage) => setPage(newPage)}
          />
        </Grid>
      </Grid>

      <Table>
        <TableBody>
          {displayedGames.map(
            ({ id, name, players, age, bggMatchId, foundBggMatches }) => (
              <TableRow key={id}>
                <TableCell align="left">
                  <Typography>{name}</Typography>
                  <Typography variant="caption">
                    Players: {players}, Age: {age}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {bggMatchId ? (
                    <IconButton
                      onClick={() =>
                        window.open(
                          `https://boardgamegeek.com/boardgame/${bggMatchId}`
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </IconButton>
                  ) : (
                    <Typography>None</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {/* {JSON.stringify(game.foundBggMatches)} */}
                  {foundBggMatches.length ? (
                    <BggMatchSelector
                      matches={foundBggMatches}
                      currentMatch={bggMatchId}
                      onMatchConfirm={matchId =>
                        onEpicBggMatchConfirm(id, matchId)
                      }
                      onMatchesClean={() => onEpicBggMatchesClean(id)}
                    />
                  ) : (
                    <React.Fragment>
                      <Typography component="span">
                        {!bggMatchId
                          ? "No matches found"
                          : "Match already confirmed"}{" "}
                        <FontAwesomeIcon
                          icon={!bggMatchId ? faSadTear : faSmile}
                        />
                      </Typography>
                    </React.Fragment>
                  )}
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function BggMatchSelector({
  matches,
  currentMatch = null,
  onMatchConfirm,
  onMatchesClean
}) {
  const [selected, setSelected] = React.useState(currentMatch);
  // const currentlySelected = matches.find(x => x.id === selected);
  return (
    <Toolbar>
      <Select
        value={selected || ""}
        native
        onChange={event => setSelected(event.currentTarget.value || null)}
      >
        <option value=""></option>
        {matches.map(({ id, name, yearpublished }) => (
          <option key={id} value={id}>
            {typeof name[0] === "string" ? name[0] : name[0]["_"]} (
            {yearpublished ? yearpublished[0] : "???"})
          </option>
        ))}
      </Select>
      {!!selected && (
        <React.Fragment>
          <IconButton
            onClick={() =>
              window.open(`https://boardgamegeek.com/boardgame/${selected}`)
            }
          >
            <FontAwesomeIcon icon={faEye} />
          </IconButton>
          {selected !== currentMatch ? (
            <Button onClick={() => onMatchConfirm(selected)}>
              Confirm match
            </Button>
          ) : (
            <Button onClick={() => onMatchesClean()}>Clean matches</Button>
          )}
        </React.Fragment>
      )}
    </Toolbar>
  );
}

/*-- UTILITY FUNCTIONS --*/
