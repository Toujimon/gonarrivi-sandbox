import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
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
                <Route
                  path="/epic-cafe-manager"
                  render={() => <div>Epic Cafe Manager</div>}
                />
              )}
              <Route
                render={({ match, location }) => (
                  <React.Fragment>
                    <p>404 page not found: {location.pathname}</p>
                    <Route
                      path="/some-other-thing"
                      render={() => (
                        <p>
                          If this message is being displayed, you got here
                          probably by clicking on the "Some other thing" main
                          menu item. That's okay, that's basically a test to
                          show a <b>404</b> page. You can see a "normal" case,
                          for example, by following this{" "}
                          <Link to="/nowhere-to-be-found">link</Link>
                        </p>
                      )}
                    />
                  </React.Fragment>
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
