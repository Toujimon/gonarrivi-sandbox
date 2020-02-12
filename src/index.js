import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from './components/design-system'
import {
  AppBar,
  Avatar,
  Container,
  CssBaseline,
  Tabs,
  Tab,
  Typography,
  Button
} from '@material-ui/core'
import homeBannerImage from './assets/images/home-banner.jpg'
import homeAvatarImage from './assets/images/home-avatar.jpeg'
import Home from './home'
import FateProject from './fate-project'
import EpicCafeManager from './epic-cafe-manager'
import { Security, ImplicitCallback, withAuth } from '@okta/okta-react'
import io from 'socket.io-client'

const authConfig =
  process.env.REACT_APP_OKTA_ISSUER && process.env.REACT_APP_OKTA_CLIENT_ID
    ? {
        issuer: process.env.REACT_APP_OKTA_ISSUER,
        redirectUri:
          window.location.origin + '/gonarrivi-sandbox/implicit/callback',
        clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
        pkce: true
      }
    : null

/* TODO: Add async process to detect if its allowed */
const isApiAllowed = !!process.env.REACT_APP_API_HOST

const appTheme = { ...theme, primary: '#199e57' }

const StyledAppBar = styled(AppBar)`
  flex-direction: row;
`
const StyledAppBarTabs = styled(Tabs)`
  flex: 0 0 auto;
  margin-left: auto;
`

const StyledTopBanner = styled.div`
  ${props =>
    props.background
      ? `background-image: url(${props.background});
      background-size: cover;`
      : 'background-color: transparent;'}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  ${({ textColor }) => (textColor ? `color: ${textColor};` : '')}
`

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
`

function LoginButton({ isAuthenticated, onLogin, onLogout }) {
  return isAuthenticated ? (
    <Button onClick={onLogout}>Logout</Button>
  ) : (
    <Button onClick={onLogin}>Login</Button>
  )
}

const AppContent = withAuth(function AppContent({ auth }) {
  const [authenticated, setAuthenticated] = React.useState(null)
  const [socket, setSocket] = React.useState(null)
  React.useEffect(() => {
    auth.isAuthenticated().then(confirmation => {
      if (confirmation !== authenticated) {
        setAuthenticated(confirmation)
      }
    })
  })
  React.useEffect(() => {
    if (authenticated && !socket) {
      const socket = io.connect(process.env.REACT_APP_API_HOST)
      // TODO socket configurations
      socket.on('new-connection', (...args) =>
        console.log('Someone connected', args)
      )
      setSocket(socket)
      socket.on('connect', () => {
        Promise.all([auth.getAccessToken(), auth.getIdToken()]).then(
          ([accessToken, idToken]) => {
            socket.emit(
              'identify',
              { token: accessToken, idToken },
              (...args) => {
                console.log('ack from the server after identificating', args)
              }
            )
          }
        )
      })
    } else if (!authenticated && socket) {
      socket.close()
      setSocket(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, socket])

  return authenticated === null ? null : (
    <ThemeProvider theme={appTheme}>
      <CssBaseline>
        <StyledAppBar position="sticky">
          <Route path="/:subPath?">
            {({ match, history }) => (
              <StyledAppBarTabs
                value={match.params.subPath || ''}
                onChange={(e, newValue) => history.push(`/${newValue}`)}
              >
                <Tab value="" label="Home" />
                <Tab value="fate-core-utils" label="FATE CORE Utils" />
                {!!(authenticated && isApiAllowed) && (
                  <Tab value="epic-cafe-manager" label="Epic Cafe Manager" />
                )}
              </StyledAppBarTabs>
            )}
          </Route>
          {authenticated !== null && (
            <LoginButton
              isAuthenticated={authenticated}
              onLogin={() => auth.login('/')}
              onLogout={() => auth.logout('/')}
            />
          )}
        </StyledAppBar>
        <Route
          exact
          path="/"
          render={() => (
            <StyledTopBanner background={homeBannerImage} textColor="white">
              <Typography gutterBottom variant="h3">
                Gonzalo Arrivi's Sandbox
              </Typography>
              <StyledAvatar src={homeAvatarImage} />
            </StyledTopBanner>
          )}
        />
        <Container>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/fate-core-utils" component={FateProject} />
            {!!(authenticated && isApiAllowed) && (
              <Route path="/epic-cafe-manager" component={EpicCafeManager} />
            )}
            <Route
              render={({ location }) => (
                <p>404 page not found: {location.pathname}</p>
              )}
            />
          </Switch>
        </Container>
      </CssBaseline>
    </ThemeProvider>
  )
})

function App() {
  return (
    <BrowserRouter basename="/gonarrivi-sandbox">
      <Security {...authConfig}>
        <Switch>
          <Route path="/implicit/callback" exact component={ImplicitCallback} />
          <Route component={AppContent} />
        </Switch>
      </Security>
    </BrowserRouter>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
