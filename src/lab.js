import React, { useState } from "react";
import { Transition } from "react-transition-group";
import { StyledBox, StyledGrid, StyledCell } from "./components/design-system";
import Mounter from "./components/mounter";
import List from "./components/list";
import RadialProgress from "./components/radial-progress";
import MyModalWindow from "./components/modals";
import WebWorkerTester from "./components/web-worker-tester";
import LineClamperTester from "./components/line-clamper-tester";
import FateDiceRoller from "./components/fate-dice-roller";
import TypeAhead from "./components/typeahead";

const timeout = 4000;
const BackdropTransition = props => <Transition timeout={timeout} {...props} />;

function HooksTest(props) {
  const [name, setName] = useState(props.defaultName);
  const [surname, setSurname] = useState(props.defaultSurname);
  const handlers = { setName, setSurname };
  function handleChange(e) {
    handlers["set" + e.target.name](e.target.value);
  }

  return (
    <StyledBox>
      <label>
        Name:
        <input name="Name" type="text" value={name} onChange={handleChange} />
      </label>
      <br />
      <label>
        Surname:
        <input
          name="Surname"
          type="text"
          value={surname}
          onChange={handleChange}
        />
      </label>
    </StyledBox>
  );
}

function Lab() {
  return (
    <React.Fragment>
      <h3>Components Laboratory</h3>
      <p>
        Some components to play around with solutions to different problems I've
        been dealing in the past (or just to have fun trying libraries)
      </p>
      <h4>TypeAhead input</h4>
      <p>Custom implementation for a TypeAhead component</p>
      <Mounter>
        <TypeAhead />
      </Mounter>
      <h4>Responsive Grid layout component</h4>
      <p>
        A very very VERY simple implementation of grid layouts using components.
      </p>
      <p>
        Acts similar as <b>Bootstrap</b>, but it's implementation is fully
        developed using <b>Styled components</b>.
      </p>
      <p>
        Cells can have a "width" from 1 to 12, and it can be stablished the
        width for certain screen widths (from "xs", "md" and "lg");
      </p>
      <Mounter name="Grid">
        <StyledGrid>
          <StyledCell color="red" col-6 col-8-md col-10-lg>
            Sumthing
          </StyledCell>
          <StyledCell color="pink" col-6 col-4-md col-2-lg>
            Sumthing
          </StyledCell>
          <StyledCell color="lightblue" col-12>
            Sumthing
          </StyledCell>
          <StyledCell color="green" col-5 col-12-xs>
            Sumthing
          </StyledCell>
          <StyledCell color="yellow" col-7>
            Sumthing
          </StyledCell>
        </StyledGrid>
      </Mounter>
      <h4>Line Clamper</h4>
      <p>
        This component takes care of the line clamping for those elements where
        only a maximum number of lines of text must show.
      </p>
      <p>
        It uses javascript to check the computed <b>Line Height</b> for its
        content when it's mounted, so it can know it's maximum height.
      </p>
      <Mounter name="LineClamper">
        <LineClamperTester />
      </Mounter>
      <h4>Transitions with "react-transition-group" library</h4>
      <p>
        Just some tests using this library to work with css transitions easily.
      </p>
      <Mounter name="List with transitions">
        <List />
      </Mounter>
      <h4>Radial progress component (SVG + CSS)</h4>
      <p>
        Made use of CSS attributes for SVG components to create a simple radial
        progress animation. It doesn't work on every browser (sadly).
      </p>
      <Mounter name="Radial progress">
        <RadialProgress />
      </Mounter>
      <h4>Tests with "react-overlays" library</h4>
      <p>
        A neat library that leverages the need of creating these kind of
        components. There goes some tests and examples making use of it.
      </p>
      <Mounter name="Modal" unmountOnCallback="onHide">
        <MyModalWindow
          show={true}
          title="my title"
          footer="my footer"
          autoFocus={false}
          backdropTransition={BackdropTransition}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#fff",
              border: "1px solid yellow",
              whiteSpace: "nowrap"
            }}
          >
            Something to show here
            <br />
            Something to show here
            <br />
            Something to show here
            <br />
          </div>
        </MyModalWindow>
      </Mounter>
      <h4>Hooks proposal test</h4>
      <p>
        It's a couple of functional components making use of React Hooks to
        handle the state of the inputs they hold (hooks proposal for React v16.7
        alpha).
      </p>
      <Mounter name="Hooks test">
        <span>
          <HooksTest defaultName="Pedro" defaultSurname="Picapiedra" />
          <HooksTest />
        </span>
      </Mounter>
    </React.Fragment>
  );
}

export default Lab;
