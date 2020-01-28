import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "./components/design-system";
import {
  AppBar,
  Avatar,
  Container,
  CssBaseline,
  Tabs,
  Tab,
  Typography
} from "@material-ui/core";
import homeBannerImage from "./assets/images/home-banner.jpg";
import homeAvatarImage from "./assets/images/home-avatar.jpeg";
import Home from "./home";
import FateProject from "./fate-project";
import EpicCafeManager from "./epic-cafe-manager";

const appTheme = { ...theme, primary: "#199e57" };

const StyledAppBar = styled(AppBar)`
  display: flex;
`;
const StyledAppBarTabs = styled(Tabs)`
  flex: 0 0 auto;
  margin-left: auto;
`;

const StyledTopBanner = styled.div`
  ${props =>
    props.background
      ? `background-image: url(${props.background});
      background-size: cover;`
      : "background-color: transparent;"}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  ${({ textColor }) => (textColor ? `color: ${textColor};` : "")}
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
`;

/* TODO: Add async process to detect if its allowed */
const isApiAllowed = window.location.hostname === "localhost";

function App() {
  return (
    <BrowserRouter basename="/gonarrivi-sandbox">
      <ThemeProvider theme={appTheme}>
        <CssBaseline>
          <StyledAppBar position="sticky">
            <Route path="/:subPath?">
              {({ match, history }) => (
                <StyledAppBarTabs
                  value={match.params.subPath || ""}
                  onChange={(e, newValue) => history.push(`/${newValue}`)}
                >
                  <Tab value="" label="Home" />
                  <Tab value="fate-core-utils" label="FATE CORE Utils" />
                  {isApiAllowed && (
                    <Tab value="epic-cafe-manager" label="Epic Cafe Manager" />
                  )}
                </StyledAppBarTabs>
              )}
            </Route>
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
              {!!isApiAllowed && (
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
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
