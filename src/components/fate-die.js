import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinusSquare,
  faPlusSquare,
  faSquare
} from "@fortawesome/free-solid-svg-icons";

export const DEFAULT_SIZE = 40;

function getDiceValue(value) {
  return Math.min(Math.max(isNaN(value) ? 0 : Number(value), 1), 6);
}

const StyledDice = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${({ size }) => Math.max(size, 0) || DEFAULT_SIZE}px;
  width: ${({ size }) => Math.max(size, 0) || DEFAULT_SIZE}px;
  font-size: ${({ size }) => Math.floor(((Math.max(size, 0) || 40) * 3) / 4)}px;
  border: 1px solid black;
  border-radius: 4px;
  background-color: white;
  color: #333;
  `;

const FateDie = props => {
  const { value: propsValue, ...otherProps } = props;
  const value = getDiceValue(propsValue);
  return (
    <StyledDice {...otherProps} title={"" + value}>
      {value < 3 ? (
        <FontAwesomeIcon icon={faMinusSquare} />
      ) : value > 4 ? (
        <FontAwesomeIcon icon={faPlusSquare} />
      ) : (
        <FontAwesomeIcon icon={faSquare} />
      )}
    </StyledDice>
  );
};

FateDie.propTypes = {
  value: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired
};

export default FateDie;
