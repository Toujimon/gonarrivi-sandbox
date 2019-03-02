import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import styled, { injectGlobal, ThemeProvider } from "styled-components";
import { transparentize } from "polished";
import {
  StyledBox,
  theme,
  RESPONSIVE_SIZES,
  createResponsiveRule
} from "./components/design-system";
import Menu, { MenuGroup, MenuItem, asActionElement } from "./components/menu";
import Home from "./home";
import Lab from "./lab";
import AdventOfCode from "./advent-of-code";
import FateProject from "./fate-project";

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
  overflow: auto;
  box-sizing: border-box;
  font-family: ${({ theme }) => theme.fontFamily};
  ${createResponsiveRule(RESPONSIVE_SIZES.MEDIUM)`padding: 0 10%`}
  ${createResponsiveRule(RESPONSIVE_SIZES.LARGE)`padding: 0 20%`}
`;
StyledApp.defaultProps = { theme };

const StyledHeader = styled.header`
  margin: 8px;
  border-radius: 10px;
  text-align: center;
  color: ${({ theme }) => theme.textOverPrimary};
  > span {
    display: inline-flex;
    align-items: center;
    > h1 {
      color: ${({ theme }) => theme.textOverPrimary};
    }
    > img {
      height: 40px;
    }
    *:not(:first-child) {
      margin-left: 8px;
    }
  }
  > h2 {
    font-size: 20px;
  }
  img {
    height: 100px;
  }
  background-color: ${({ theme }) => theme.primary};
`;
StyledHeader.defaultProps = { theme };

const StyledAppBody = styled.div`
  margin: 0 8px 8px;
  background-color: #fff;
`;

function MainHeader() {
  return (
    <React.Fragment>
      <h2>My place to test web related things</h2>
      <a
        title="By Chris Williams [Public domain], via Wikimedia Commons"
        href="https://commons.wikimedia.org/wiki/File:Unofficial_JavaScript_logo_2.svg"
        target="_blank"
      >
        <img
          alt="Unofficial JavaScript logo 2"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/512px-Unofficial_JavaScript_logo_2.svg.png"
        />
      </a>
      <a
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
      </a>
    </React.Fragment>
  );
}

const appTheme = { ...theme, primary: "#199e57" };

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <StyledApp>
        <StyledHeader>
          <h1>
            <span>Gonzalo Arrivi's Sandbox</span>
          </h1>
        </StyledHeader>
        <StyledAppBody>
          <StyledBox compact>
            <Menu>
              <MenuGroup>
                <RouterLinkMenuItem exact path="/" to="/">
                  Home
                </RouterLinkMenuItem>
                <RouterLinkMenuItem path="/lab" to="/lab">
                  Lab
                </RouterLinkMenuItem>
                {/* <RouterLinkMenuItem path="/advent-of-code" to="/advent-of-code">
                  Advent of Code
                </RouterLinkMenuItem> */}
                <RouterLinkMenuItem path="/fate-project" to="/fate-project">
                  Fate Project
                </RouterLinkMenuItem>
              </MenuGroup>
            </Menu>
          </StyledBox>
          <StyledBox layout="column">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/lab" component={Lab} />
              <Route path="/advent-of-code" component={AdventOfCode} />
              <Route path="/fate-project" component={FateProject} />
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
          </StyledBox>
        </StyledAppBody>
      </StyledApp>
    </ThemeProvider>
  );
}

const RoutedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<RoutedApp />, rootElement);
