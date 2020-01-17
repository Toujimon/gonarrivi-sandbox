import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { transparentize } from "polished";
import {
  theme,
  RESPONSIVE_SIZES,
  createResponsiveRule
} from "./components/design-system";
import Menu, { MenuGroup, MenuItem, asActionElement } from "./components/menu";
import Home from "./home";
import FateProject from "./fate-project";

const appTheme = { ...theme, primary: "#199e57" };

const ActionRouterLink = asActionElement(Link);
function RouterLinkMenuItem({ exact, path, to, children }) {
  return (
    <Route exact={exact} path={path}>
      {({ match }) => (
        <MenuItem active={match}>
          {!match ? (
            <ActionRouterLink to={to}>{children}</ActionRouterLink>
          ) : (
            children
          )}
        </MenuItem>
      )}
    </Route>
  );
}

const StyledApp = styled.div`
  background-color: ${({ theme }) => transparentize(0.9, theme.primary)};
  min-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fontFamily};
  display: flex;
  flex-direction: column;
`;
StyledApp.defaultProps = { theme };

const StyledHeader = styled.header`
  flex: 0 0 auto;
  text-align: center;
  color: ${({ theme }) => theme.textOverPrimary};
  background-color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  padding: 0 8px;
  > *:not(:first-child) {
    margin-left: 8px;
  }
`;
StyledHeader.defaultProps = { theme };

StyledHeader.ImageLink = styled.a`
  height: 48px;
  > img {
    height: 100%;
  }
`;

const StyledAppBody = styled.div`
  flex: 1 1 auto;
  overflow: auto;
  padding: 0 16px;
  background-color: #fff;
  ${createResponsiveRule(RESPONSIVE_SIZES.MEDIUM)`margin: 0 64px 8px`}
`;

function MainHeader() {
  return (
    <StyledHeader>
      <h1>Gonzalo Arrivi's Sandbox</h1>
      <StyledHeader.ImageLink
        title="By Chris Williams [Public domain], via Wikimedia Commons"
        href="https://commons.wikimedia.org/wiki/File:Unofficial_JavaScript_logo_2.svg"
        target="_blank"
      >
        <img
          alt="Unofficial JavaScript logo 2"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/512px-Unofficial_JavaScript_logo_2.svg.png"
        />
      </StyledHeader.ImageLink>
      <StyledHeader.ImageLink
        target="_blank"
        title="Facebook [Public domain or CC BY-SA 1.0 
 (https://creativecommons.org/licenses/by-sa/1.0
)], via Wikimedia Commons"
        href="https://commons.wikimedia.org/wiki/File:React-icon.svg"
      >
        <img
          alt="React-icon"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
        />
      </StyledHeader.ImageLink>
      <ThemeProvider theme={{ ...appTheme, primary: "#b0b584" }}>
        <Menu>
          <MenuGroup>
            <RouterLinkMenuItem exact path="/" to="/">
              Home
            </RouterLinkMenuItem>
            {/* <RouterLinkMenuItem path="/advent-of-code" to="/advent-of-code">
                  Advent of Code
                </RouterLinkMenuItem> */}
            <RouterLinkMenuItem path="/fate-core-utils" to="/fate-core-utils">
              FATE CORE Utils
            </RouterLinkMenuItem>
          </MenuGroup>
        </Menu>
      </ThemeProvider>
    </StyledHeader>
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <StyledApp>
        <MainHeader />
        <StyledAppBody>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/fate-core-utils" component={FateProject} />
            <Route
              render={({ match, location }) => (
                <React.Fragment>
                  <p>404 page not found: {location.pathname}</p>
                  <Route
                    path="/some-other-thing"
                    render={() => (
                      <p>
                        If this message is being displayed, you got here
                        probably by clicking on the "Some other thing" main menu
                        item. That's okay, that's basically a test to show a{" "}
                        <b>404</b> page. You can see a "normal" case, for
                        example, by following this{" "}
                        <Link to="/nowhere-to-be-found">link</Link>
                      </p>
                    )}
                  />
                </React.Fragment>
              )}
            />
          </Switch>
        </StyledAppBody>
      </StyledApp>
    </ThemeProvider>
  );
}

const RoutedApp = () => (
  <BrowserRouter basename="/gonarrivi-sandbox">
    <App />
  </BrowserRouter>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<RoutedApp />, rootElement);
