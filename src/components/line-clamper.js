import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { StyledButton } from './design-system'

const valueFormatRegex = /(\d+)(\.\d*)?([a-z]+)?/

const StyledToggleButton = styled(StyledButton)`
  position: absolute;
  height: ${({ lineHeight }) => `${lineHeight.value}${lineHeight.unit}`};
  right: 0;
  bottom: 0;
`

const StyledWrapper = styled.div`
  position: relative;
  ${({ lineHeight }) => !lineHeight && `overflow: hidden; height: 0;`}
  padding-bottom: ${({ isExpanded, lineHeight }) =>
    (isExpanded && lineHeight && '' + lineHeight.value + lineHeight.unit) ||
    '0'};
`

const StyledContainer = styled.div`
  ${({ lineHeight }) =>
    lineHeight && 'line-height: ' + lineHeight.value + lineHeight.unit + ';'}
  ${({ lineHeight, isExpanded, maxLines }) =>
    lineHeight &&
    !isExpanded &&
    'max-height: ' +
      maxLines * lineHeight.value +
      lineHeight.unit +
      ';' +
      'overflow: hidden;'}
`

export default class StyledLineClamper extends React.Component {
  static propTypes = {
    maxLines: PropTypes.number.isRequired,
    renderExpansionElement: PropTypes.func
  }

  static defaultProps = {
    renderExpansionElement: (lineHeight, isExpanded, onExpansionToggle) => (
      <StyledToggleButton
        primary
        lineHeight={lineHeight}
        onClick={onExpansionToggle}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </StyledToggleButton>
    )
  }

  state = {
    lineHeight: null,
    isExpanded: false,
    showExpansionToggle: false
  }

  _contentRef = React.createRef()

  _refreshExpansionToggleState = () => {
    const { lineHeight, showExpansionToggle: currentValue } = this.state
    const { maxLines } = this.props
    if (lineHeight) {
      const contentElRect = this._contentRef.current.getBoundingClientRect()
      const showExpansionToggle =
        contentElRect.bottom - contentElRect.top > lineHeight.value * maxLines
      if (showExpansionToggle !== currentValue) {
        this.setState({ showExpansionToggle })
      }
    }
  }

  _handleExpansionToggle = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }))
  }

  componentDidMount() {
    const computedStyle = window.getComputedStyle(this._contentRef.current)
    const lineHeight = (() => {
      const matches =
        valueFormatRegex.exec(computedStyle.getPropertyValue('line-height')) ||
        valueFormatRegex.exec(computedStyle.getPropertyValue('font-size'))
      return {
        value: matches[1],
        unit: matches[3] || ''
      }
    })()
    this.setState({ lineHeight }, () => {
      this._refreshExpansionToggleState()
      window.addEventListener('resize', this._refreshExpansionToggleState)
    })
  }

  componentDidUpdate = nextProps => {
    this._refreshExpansionToggleState()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._refreshExpansionToggleState)
  }

  render() {
    const { children, maxLines, renderExpansionElement } = this.props
    const { lineHeight, isExpanded, showExpansionToggle } = this.state
    return (
      <StyledWrapper lineHeight={lineHeight} isExpanded={isExpanded}>
        <StyledContainer
          lineHeight={lineHeight}
          isExpanded={isExpanded}
          maxLines={maxLines}
        >
          <div ref={this._contentRef}>{children}</div>
        </StyledContainer>
        {showExpansionToggle &&
          renderExpansionElement(
            lineHeight,
            isExpanded,
            this._handleExpansionToggle
          )}
      </StyledWrapper>
    )
  }
}
