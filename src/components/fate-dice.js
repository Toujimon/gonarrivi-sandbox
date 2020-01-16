import * as React from "react";
import * as PropTypes from "prop-types";
import styled, { keyframes, css } from "styled-components";
import { lighten } from "polished";
import { theme } from "./design-system";
import FateDie from "./fate-die";
export { DEFAULT_SIZE } from "./fate-die";

const CLICK_ANIMATION_MILLISECONDS = 100;

const StyledWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`;

const hoveringKeyFrames = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100%{
    transform: scale(1);
  }
`;

const StyledSelectableFateDie = styled(FateDie)`
  ${({ onClick }) =>
    onClick
      ? css`
          cursor: pointer;
          &:hover {
            animation: ${hoveringKeyFrames} 0.8s linear infinite;
          }
        `
      : ""}
  ${({ selected, theme }) =>
    selected ? `background-color: ${lighten(0.3, theme.primary)};` : ""}
`;
StyledSelectableFateDie.defaultProps = {
  theme
};

const clickedKeyFrames = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100%{
    transform: translateY(0);
  }
`;

const StyledSelectionChangedFateDice = styled(StyledSelectableFateDie)`
  animation: ${css`
    ${clickedKeyFrames} ${CLICK_ANIMATION_MILLISECONDS}ms linear
  `};
`;

class FateDice extends React.Component {
  state = {
    selectionChangedIndex: -1
  };
  _memoizedHandlers = {};

  _onSelectionChange = (handler, index, ...args) => {
    if (this.state.selectionChangedIndex !== index) {
      this.setState({ selectionChangedIndex: index }, () =>
        setTimeout(
          () =>
            this.setState({ selectionChangedIndex: -1 }, () =>
              handler(index, ...args)
            ),
          CLICK_ANIMATION_MILLISECONDS
        )
      );
    }
  };

  _getMemoizedHandler = (index, handler) => {
    if (!this._memoizedHandlers[index]) {
      this._memoizedHandlers[index] = handler
        ? (...args) => this._onSelectionChange(handler, index, ...args)
        : null;
    }
    return this._memoizedHandlers[index];
  };

  render() {
    const { rollId, dice, onDieSelect } = this.props;
    const { selectionChangedIndex } = this.state;
    return (
      <StyledWrapper>
        <span>
          {dice.map((x, i) =>
            selectionChangedIndex !== i ? (
              <StyledSelectableFateDie
                value={x.value}
                selected={x.selected}
                onClick={this._getMemoizedHandler(i, onDieSelect)}
              />
            ) : (
              <StyledSelectionChangedFateDice
                value={x.value}
                selected={x.selected}
              />
            )
          )}
        </span>
      </StyledWrapper>
    );
  }
}

FateDice.propTypes = {
  rollId: PropTypes.any.isRequired,
  dice: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      rerollCount: PropTypes.number.isRequired,
      selected: PropTypes.bool
    })
  ).isRequired,
  onDieSelect: PropTypes.func
};

export default FateDice;
