import React from 'react'
import { StyledBox, StyledButton } from './design-system'

export default class Mounter extends React.Component {
  state = {
    mounted: false
  }
  _handleUnmount = () => {
    this.setState(prevState => ({ mounted: !prevState.mounted }))
  }
  render() {
    const { unmountOnCallback } = this.props
    const element = (() => {
      const el = React.Children.only(this.props.children)
      return !unmountOnCallback
        ? el
        : React.cloneElement(el, { [unmountOnCallback]: this._handleUnmount })
    })()
    return (
      <StyledBox compact>
        <StyledButton onClick={this._handleUnmount}>
          {`${!this.state.mounted ? 'Mount' : 'Unmount'} ${this.props.name ||
            ''}`}
        </StyledButton>
        {this.state.mounted && (
          <StyledBox compact color="orange">
            {element}
          </StyledBox>
        )}
      </StyledBox>
    )
  }
}
