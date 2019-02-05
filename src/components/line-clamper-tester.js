import React from 'react'
import { StyledBox } from './design-system'
import LineClamper from './line-clamper'

export default class LineClamperTester extends React.Component {
  state = {
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a nibh in diam fermentum molestie. Cras eget neque id tortor iaculis ultricies. Proin commodo tellus erat, sit amet placerat massa posuere a. Cras elementum sed augue vel aliquam. Phasellus at sodales turpis. Praesent posuere purus bibendum ornare faucibus. Quisque lobortis pellentesque purus, quis hendrerit ligula laoreet nec. Sed sit amet scelerisque felis, quis blandit nulla. Donec malesuada, magna a lacinia bibendum, elit nisl placerat ante, id interdum sapien lectus nec justo.\n\nProin rutrum felis purus, eu scelerisque ante semper condimentum.Cras dignissim purus felis.Sed venenatis pretium hendrerit.Vestibulum laoreet est at tempus mattis.Nunc a imperdiet nulla, varius imperdiet neque.Phasellus varius sit amet tortor ut malesuada.Phasellus tristique, nisi eget auctor commodo, nibh dui molestie ante, id aliquet neque justo vel nisi.Mauris id suscipit lorem, non eleifend elit.In vestibulum ultricies velit et ultricies.Fusce non libero venenatis, egestas nulla sed, tristique mi.Nullam facilisis lacinia dui, nec tincidunt orci rutrum ac.Phasellus id nulla eros.',
    maxLines: 6
  }
  _handleTextChange = e => {
    this.setState({ text: e.currentTarget.value })
  }
  _handleMaxLinesChange = e => {
    this.setState({ maxLines: Math.max(1, Number(e.currentTarget.value)) })
  }
  render() {
    const { text, maxLines } = this.state
    return (
      <div>
        <StyledBox>
          <label>
            Text:
            <textarea value={text} onChange={this._handleTextChange} />
          </label>
          <br />
          <label>
            Max. Lines
            <input
              type="number"
              value={maxLines}
              onChange={this._handleMaxLinesChange}
            />
          </label>
        </StyledBox>
        <StyledBox>
          <LineClamper maxLines={maxLines}>
            <span
              dangerouslySetInnerHTML={{
                __html: text.replace(/\n/g, '<br />')
              }}
            />
          </LineClamper>
        </StyledBox>
      </div>
    )
  }
}
