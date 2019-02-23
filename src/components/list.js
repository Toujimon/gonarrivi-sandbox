import * as React from "react";
import { TransitionGroup, Transition } from "react-transition-group";
import styled, { keyframes, css } from "styled-components";
import { StyledButton, StyledBox } from "./design-system";

// keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(56px);
    margin-bottom: -24px;
  }
  to {
    opacity: 1;
    transform: translateX(0);
    margin-bottom: 0;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
    margin-bottom: 0;
  }
  to {
    opacity: 0;
    transform: translateX(-56px);
    margin-bottom: -24px;
  }
`;

const fadeAnimation = entering => css`animation: ${entering ? fadeIn : fadeOut} 500ms ease-${entering ? 'in' : 'out'}`

const ListItem = styled.li`
  list-style: none;
  ${props =>
    (props.entering || props.exiting)
      ? fadeAnimation(props.entering)
      : ""}
`;

export default class List extends React.Component {
  state = {
    items: [
      { key: 1, value: 1 },
      { key: 2, value: 2 },
      { key: 3, value: 3 },
      { key: 4, value: 4 }
    ]
  };
  _counter = 10;
  _handleClick = () => {
    this.setState(prevState => ({
      items: prevState.items.concat({
        key: this._counter,
        value: "" + this._counter++
      })
    }));
  };
  _handleRemove = key => {
    this.setState(prevState => ({
      items: prevState.items.filter(x => x.key !== key)
    }));
  };
  render() {
    const { items } = this.state;
    return (
      <div className="component-list">
        <h3>List with transitions</h3>
        <p>
          This is a list that uses 'TransitionGroup' and 'CSSTransition'
          components to animate the new and leaving objects
        </p>
        <StyledButton onClick={this._handleClick}>Add item</StyledButton>
        <TransitionGroup>
          {items.map((x, i) => (
            <Transition key={x.key} classNames="transition" timeout={500}>
              {state => (
                <ListItem
                  entering={state === "entering"}
                  exiting={state === "exiting"}
                >
                  <StyledBox compact>
                    <StyledButton onClick={e => this._handleRemove(x.key)}>
                      Remove
                    </StyledButton>{" "}
                    {x.value}
                  </StyledBox>
                </ListItem>
              )}
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    );
  }
}
