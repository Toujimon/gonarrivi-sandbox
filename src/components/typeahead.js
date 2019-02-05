import React, { useState, createRef } from "react";
import { Overlay } from "react-overlays";
import styled from "styled-components";
import { transparentize } from "polished";
import {
  StyledRoundBorderedBlock,
  layoutPropsStyles,
  theme
} from "./design-system";

const StyledOverlay = styled(StyledRoundBorderedBlock)`
  position: absolute;
  ${layoutPropsStyles}
`;

const StyledItem = styled.div`
  cursor: pointer;
  padding: 4px;
  ${({ selected, theme }) => `
  background-color: ${selected ? theme.primary : "white"};
  ${selected ? `color: ${theme.textOverPrimary};` : ""}
  `}
  :not(:first-child) {
    border-top: 1px solid black;
  }
  :hover {
    background-color: ${({ theme }) => transparentize(0.5, theme.primary)};
  }
`;
StyledItem.defaultProps = { theme };

class TypeAhead extends React.Component {
  state = {
    haveFocus: false,
    valueChangedSinceLastSelection: false
  };
  _inputRef = createRef();
  _blurTimeout = null;
  _handleFocus = e => {
    console.log("focus", e.currentTarget);
    if (!this.state.haveFocus) {
      this.setState(
        { haveFocus: true },
        () => this.props.onFocus && this.props.onFocus(...args)
      );
    } else if (this._blurTimeout) {
      clearTimeout(this._blurTimeout);
      this._blurTimeout = null;
    }
  };
  _handleBlur = e => {
    console.log("blur", e.currentTarget);
    if (this.state.haveFocus && !this._blurTimeout) {
      this._blurTimeout = setTimeout(() => {
        this.setState({ haveFocus: false }, () => {
          this._blurTimeout = null;
          this.props.onBlur && this.props.onBlur(...args);
        });
      });
    }
  };
  render() {
    const {
      value = "",
      suggestions = [],
      onChange,
      ...otherProps
    } = this.props;
    const { haveFocus, valueChangedSinceLastSelection } = this.state;
    const foundSuggestions = value
      ? suggestions.filter(x => x.includes(value))
      : [];
    const selectedSuggestion = foundSuggestions.indexOf(value);
    return (
      <span>
        <input
          {...otherProps}
          type="text"
          value={value}
          ref={this._inputRef}
          onChange={onChange}
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
        />
        <Overlay
          show={!!foundSuggestions.length && haveFocus}
          target={this._inputRef.current}
          placement="bottom"
        >
          <StyledOverlay
            layout="column"
            separation={0}
            onFocus={this._handleFocus}
            onBlur={this._handleBlur}
          >
            {foundSuggestions.map((x, i) => (
              <StyledItem
                key={x}
                selected={i === selectedSuggestion}
                onClick={e =>
                  console.log("click", e.currentTarget) ||
                  (onChange && onChange({ target: { value: x } }))
                }
              >
                {x}
              </StyledItem>
            ))}
          </StyledOverlay>
        </Overlay>
      </span>
    );
  }
}

const TEST_SUGGESTIONS = [
  "algo",
  "otro algo",
  "ese",
  "ese de ahi",
  "ese otro",
  "vamos"
];
function Tester(props) {
  const [value, setState] = useState(props.value);
  function handleChange(e) {
    setState(e.target.value);
  }
  return (
    <TypeAhead
      {...props}
      suggestions={TEST_SUGGESTIONS}
      value={value}
      onChange={handleChange}
    />
  );
}

export default Tester;
