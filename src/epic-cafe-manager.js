import React from 'react'
import styled from 'styled-components'
import { StyledBox } from './components/design-system'
import {
  Typography,
  Grid,
  Toolbar,
  Select,
  Button,
  IconButton,
  TablePagination
} from '@material-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faSadTear,
  faSmile,
  faPlus
} from '@fortawesome/free-solid-svg-icons'
import { withAuth } from '@okta/okta-react'

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
  )
}

/*-- PRIVATE COMPONENTS --*/
/* To be refactored out if it seems like it may be useful on other modules */

const EpicBggMatcherContainer = withAuth(function EpicBggMatcherContainer({
  auth
}) {
  const [[catalog, mustFetch], setState] = React.useState([null, true])
  function setCatalog(catalog) {
    setState([catalog, false])
  }
  function refetchCatalog() {
    setState([catalog, true])
  }

  function fetchWithAuth(url, options = {}) {
    return auth.getAccessToken().then(token =>
      fetch(`//${process.env.REACT_APP_API_HOST}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`
        }
      })
    )
  }

  React.useEffect(() => {
    if (mustFetch) {
      fetchWithAuth('/api/catalog')
        .then(response =>
          response
            .json()
            .then(jsonData => jsonData)
            .then(({ epicCatalog, bggCatalog, epicBggJoin }) => {
              return epicCatalog.map(
                ({ id, name, players, age, coordinates }) => {
                  return {
                    id,
                    name,
                    players:
                      players.type === 'range' || players.type === 'min'
                        ? `${players.min} - ${players.max || ''}`
                        : players.type,
                    age,
                    coordinates,
                    bggMatchId: epicBggJoin[id].bggMatchId,
                    foundBggMatches:
                      epicBggJoin[id].foundBggMatches &&
                      epicBggJoin[id].foundBggMatches.map(
                        matchId => bggCatalog[matchId]
                      )
                  }
                }
              )
            })
        )
        .catch(error => {
          console.log(error)
          return []
        })
        .then(processedCatalog => {
          setCatalog(processedCatalog)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustFetch])

  function handleEpicBggMatchConfirm(id, bggMatchId) {
    fetchWithAuth('/api/catalog', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, bggMatchId })
    }).then(res => {
      if (res.status === 200) {
        refetchCatalog()
      } else {
        console.error('Error while trying to update data:', res.statusText)
      }
    })
  }

  function handleEpicBggMatchesClean(id) {
    fetchWithAuth('/api/catalog', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    }).then(res => {
      if (res.status === 200) {
        refetchCatalog()
      } else {
        console.error('Error while trying to clean matches:', res.statusText)
      }
    })
  }

  function handleEpicBggMatchAdd(id, bggMatchId) {
    fetchWithAuth('/api/catalog', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, bggMatchId })
    }).then(res => {
      if (res.status === 200) {
        refetchCatalog()
      } else {
        console.error('Error while trying to update data:', res.statusText)
      }
    })
  }

  return catalog === null ? (
    'Loading catalog information, may take a while...'
  ) : (
    <EpicBggMatcher
      games={catalog}
      onEpicBggMatchConfirm={handleEpicBggMatchConfirm}
      onEpicBggMatchesClean={handleEpicBggMatchesClean}
      onEpicBggMatchAdd={handleEpicBggMatchAdd}
    />
  )
})

const PAGE_SIZE = 50
const MATCHES_FILTERS = [
  ['All', null],
  ['No matches', x => !x.foundBggMatches || !x.foundBggMatches.length],
  ['Just one match', x => x.foundBggMatches && x.foundBggMatches.length === 1],
  [
    'Multiple matches (2 .. 5)',
    x =>
      x.foundBggMatches &&
      x.foundBggMatches.length > 1 &&
      x.foundBggMatches.length < 6
  ],
  [
    'Multiple matches (6 ... 10)',
    x =>
      x.foundBggMatches &&
      x.foundBggMatches.length > 5 &&
      x.foundBggMatches.length < 11
  ],
  [
    'Multiple matches (11 ... 20)',
    x =>
      x.foundBggMatches &&
      x.foundBggMatches.length > 10 &&
      x.foundBggMatches.length < 21
  ],
  [
    'Multiple matches (21 ... 50)',
    x =>
      x.foundBggMatches &&
      x.foundBggMatches.length > 20 &&
      x.foundBggMatches.length < 51
  ],
  [
    'Multiple matches (51 ... )',
    x => x.foundBggMatches && x.foundBggMatches.length > 51
  ]
]

const CONFIRMED_FILTERS = [
  ['All', null],
  ['Not confirmed', x => !x.bggMatchId],
  ['Confirmed', x => !!x.bggMatchId]
]

const FILTERS = MATCHES_FILTERS.map(([, matchesFilter]) =>
  CONFIRMED_FILTERS.map(([, confirmedFilter]) => x =>
    (!matchesFilter || matchesFilter(x)) &&
    (!confirmedFilter || confirmedFilter(x))
  )
)

const StyledGrid = styled(Grid)`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`

function EpicBggMatcher({
  games,
  onEpicBggMatchConfirm,
  onEpicBggMatchesClean,
  onEpicBggMatchAdd
}) {
  const [
    [page, appliedMatchesFilterIndex, appliedConfirmedFilterIndex],
    setState
  ] = React.useState([0, 0, 0])
  const setPage = page =>
    setState([page, appliedMatchesFilterIndex, appliedConfirmedFilterIndex])
  const setAppliedMatchedFilterIndex = appliedMatchesFilterIndex =>
    setState([0, appliedMatchesFilterIndex, appliedConfirmedFilterIndex])
  const setAppliedConfirmedFilterIndex = appliedConfirmedFilterIndex =>
    setState([0, appliedMatchesFilterIndex, appliedConfirmedFilterIndex])

  const appliedFilter =
    (FILTERS[appliedMatchesFilterIndex] || [])[appliedConfirmedFilterIndex] ||
    null

  const [displayedGames, filteredGamesCount] = React.useMemo(() => {
    const filteredGames = !appliedFilter ? games : games.filter(appliedFilter)
    const displayedGames = filteredGames.slice(
      page * PAGE_SIZE,
      (page + 1) * PAGE_SIZE
    )
    return [displayedGames, filteredGames.length]
  }, [games, page, appliedFilter])

  React.useEffect(() => {
    if (page > 0 && !displayedGames.length) {
      setPage(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedGames, page])

  return (
    <StyledBox>
      <Grid container>
        <Grid item md={8}>
          <Toolbar>
            <Select
              value={appliedMatchesFilterIndex}
              native
              onChange={event =>
                setAppliedMatchedFilterIndex(Number(event.currentTarget.value))
              }
            >
              {MATCHES_FILTERS.map(([text], index) => (
                <option key={index} value={index}>
                  {text}
                </option>
              ))}
            </Select>
            <Select
              value={appliedConfirmedFilterIndex}
              native
              onChange={event =>
                setAppliedConfirmedFilterIndex(
                  Number(event.currentTarget.value)
                )
              }
            >
              {CONFIRMED_FILTERS.map(([text], index) => (
                <option key={index} value={index}>
                  {text}
                </option>
              ))}
            </Select>
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

      <ul>
        {displayedGames.map(
          ({ id, name, players, age, bggMatchId, foundBggMatches }) => (
            <StyledGrid container component="li" key={id}>
              <Grid component={Toolbar} item xs={12} md={5}>
                <div>
                  <Typography>{name}</Typography>
                  <Typography variant="caption">
                    Players: {players}, Age: {age}
                  </Typography>
                </div>
              </Grid>
              <Grid component={Toolbar} item xs={12} md={1}>
                {bggMatchId ? (
                  <IconButton
                    onClick={() =>
                      window.open(
                        `https://boardgamegeek.com/boardgame/${bggMatchId}`,
                        'epicBggMatchViewer',
                        'titlebar=no'
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </IconButton>
                ) : (
                  <Typography>None</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {/* {JSON.stringify(game.foundBggMatches)} */}

                <BggMatchSelector
                  matches={foundBggMatches || []}
                  currentMatch={bggMatchId}
                  onMatchConfirm={matchId => onEpicBggMatchConfirm(id, matchId)}
                  onMatchesClean={() => onEpicBggMatchesClean(id)}
                  onMatchAdd={matchId => onEpicBggMatchAdd(id, matchId)}
                />
              </Grid>
            </StyledGrid>
          )
        )}
      </ul>
    </StyledBox>
  )
}

const StyledSelect = styled(Select)`
  flex: 1 1 auto;
`

const StyledButton = styled(Button)`
  white-space: nowrap;
`

function BggMatchSelector({
  matches,
  currentMatch = null,
  onMatchConfirm,
  onMatchesClean,
  onMatchAdd
}) {
  const [selected, setSelected] = React.useState(
    currentMatch || (matches.length && matches[0].id) || null
  )
  // const currentlySelected = matches.find(x => x.id === selected);
  return (
    <Toolbar>
      {matches.length ? (
        <React.Fragment>
          <StyledSelect
            value={selected || ''}
            native
            onChange={event => setSelected(event.currentTarget.value || null)}
          >
            <option value=""></option>
            {matches.map(({ id, name, yearpublished }) => (
              <option key={id} value={id}>
                {typeof name[0] === 'string' ? name[0] : name[0]['_']} (
                {yearpublished ? yearpublished[0] : '???'})
              </option>
            ))}
          </StyledSelect>
          <IconButton
            onClick={() =>
              window.open(
                `https://boardgamegeek.com/boardgame/${selected}`,
                'bggMatchViewer',
                'titlebar=no'
              )
            }
          >
            <FontAwesomeIcon icon={faEye} />
          </IconButton>
          {selected !== currentMatch ? (
            <StyledButton onClick={() => onMatchConfirm(selected)}>
              {selected ? 'Confirm match' : 'Remove current match'}
            </StyledButton>
          ) : (
            <Button onClick={() => onMatchesClean()}>Clean matches</Button>
          )}
        </React.Fragment>
      ) : (
        <Typography>
          {!currentMatch ? 'No matches found' : 'Match already confirmed'}{' '}
          <FontAwesomeIcon icon={!currentMatch ? faSadTear : faSmile} />
        </Typography>
      )}
      <IconButton
        onClick={event => {
          const newBggMatchId = prompt('Add a new game match')
          if (newBggMatchId) {
            onMatchAdd(newBggMatchId)
          }
        }}
      >
        <FontAwesomeIcon icon={faPlus} />
      </IconButton>
    </Toolbar>
  )
}

/*-- UTILITY FUNCTIONS --*/
