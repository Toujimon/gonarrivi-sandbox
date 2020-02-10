import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { theme } from './design-system'

const childrenHaveRightMargin = `
  > * :not(:first-child){
    margin-left: 8px;
  }
`

const StyledMenuWrapper = styled.div`
  overflow: auto;
  display: flex;
  ${childrenHaveRightMargin}
`

export const MenuGroup = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  flex: ${({ fluid }) => (fluid ? '1 1 auto' : '0 0 auto')};
  display: flex;
  overflow: auto;
  ${childrenHaveRightMargin}
`

export const MenuItem = styled.li`
  flex: 0 0 auto;
  ${({ active, theme }) =>
    active
      ? `
  background-color: ${transparentize(0.5, theme.primary)};
  border-radius: 4px;`
      : ''}
  padding: 4px;
  display: flex;
  align-items: center;
`
MenuItem.defaultProps = { theme }

export const asActionElement = component => styled(component)`
  height: 100%;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: inherit;
  text-decoration: none;
  border: 0;
  background-color: transparent;
  :disabled {
    cursor: not-allowed;
  }
`
export const ActionLink = asActionElement('a')
export const ActionButton = asActionElement('button')

export class Menu extends React.Component {
  static propTypes = {
    wrappingTag: PropTypes.string
  }
  render() {
    const { children, ...wrapperProps } = this.props
    return <StyledMenuWrapper {...wrapperProps}>{children}</StyledMenuWrapper>
  }
}

Menu.Group = MenuGroup
Menu.Item = MenuItem
Menu.asActionElement = asActionElement

export default Menu
