import * as React from 'react'
import * as PropTypes from 'prop-types'
import styled, { keyframes, css } from 'styled-components'
import { lighten } from 'polished'
import { theme } from './design-system'
import FateDie from './fate-die'
export { DEFAULT_SIZE } from './fate-die'

const StyledWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

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
`

const StyledSelectableFateDie = styled(FateDie)`
  ${({ onClick }) =>
    onClick
      ? css`
          cursor: pointer;
          &:hover {
            animation: ${hoveringKeyFrames} 0.8s linear infinite;
          }
        `
      : ''}
  ${({ selected, theme }) =>
    selected ? `background-color: ${lighten(0.3, theme.primary)};` : ''}
`
StyledSelectableFateDie.defaultProps = {
  theme
}

function FateDice({ dice, onDieSelect }) {
  return (
    <StyledWrapper>
      <span>
        {dice.map((x, i) => (
          <StyledSelectableFateDie
            key={i}
            value={x.value}
            selected={x.selected}
            onClick={(...args) => onDieSelect(i, ...args)}
          />
        ))}
      </span>
    </StyledWrapper>
  )
}

FateDice.propTypes = {
  dice: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      selected: PropTypes.bool
    })
  ).isRequired,
  onDieSelect: PropTypes.func
}

export default FateDice
