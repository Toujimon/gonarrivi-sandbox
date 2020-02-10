import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { StyledButton, theme } from './design-system'
import Widget from './widget'
import FateDiceRoller from './fate-dice-roller'
import FateCharacterSheet from './fate-character-sheet'

const MY_FATE_CHARACTERS_KEY = 'MY_FATE_CHARACTERS'

const StyledOptions = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  width: 300px;
  overflow: hidden;
`

StyledOptions.Item = styled.li`
  flex: 1 1 auto;
  :not(:first-child) {
    margin-top: 8px;
  }
`

StyledOptions.Item.Button = styled(StyledButton)`
  height: 40px;
  width: 100%;
`

StyledOptions.Item.Button.defaultProps = { theme }

class FateCharacterManager extends React.Component {
  static propTypes = {
    onSubmit:
      PropTypes.func.isRequired /* ({skills, ...characterFields}) => any */
  }
  state = {
    selectionMethod: null,
    existingCharacters:
      (() => {
        if (localStorage) {
          const strMyCharacters = localStorage.getItem(MY_FATE_CHARACTERS_KEY)
          if (strMyCharacters) {
            try {
              return JSON.parse(strMyCharacters)
            } catch (e) {
              localStorage.removeItem(MY_FATE_CHARACTERS_KEY)
            }
          }
        }
        return null
      })() || []
  }
  _handleNewClick = () => this.setState({ selectionMethod: 'new' })
  _handleExistingClick = () => this.setState({ selectionMethod: 'existing' })
  _handleSelectionReset = () => this.setState({ selectionMethod: null })
  _handleNewCharacterSubmit = newCharacter => {
    const { onSubmit } = this.props
    const { existingCharacters } = this.state
    const newCharacterName = newCharacter.id.name
    if (newCharacterName) {
      if (!existingCharacters.some(x => x.id.name === newCharacterName)) {
        this.setState(
          prevState => ({
            existingCharacters: prevState.existingCharacters.concat({
              ...newCharacter
            })
          }),
          () => {
            if (localStorage) {
              localStorage.setItem(
                MY_FATE_CHARACTERS_KEY,
                JSON.stringify(this.state.existingCharacters)
              )
            }
            onSubmit(newCharacter)
          }
        )
      } else {
        alert('There is an already existing character with that name')
      }
    } else {
      alert('Every character needs a name')
    }
  }
  render() {
    const { selectionMethod, existingCharacters } = this.state
    const { onSubmit } = this.props
    return (
      <Widget
        commands={
          !selectionMethod
            ? [
                {
                  title: 'Load an existing character',
                  disabled: !existingCharacters.length,
                  onInvoke: this._handleExistingClick
                },
                {
                  title: 'create a new character',
                  onInvoke: this._handleNewClick,
                  primary: true
                }
              ]
            : [{ title: 'Go back', onInvoke: this._handleSelectionReset }]
        }
      >
        <h2>
          {!selectionMethod
            ? "Want to play? first you'll need a character..."
            : selectionMethod === 'new'
            ? 'Nice! Make it your own!'
            : 'Cool! Here they are for you to choose from'}
        </h2>
        {selectionMethod && (
          <React.Fragment>
            {selectionMethod === 'new' ? (
              <FateCharacterSheet onSubmit={this._handleNewCharacterSubmit} />
            ) : (
              <StyledOptions>
                {[...existingCharacters].map((character, i) => (
                  <StyledOptions.Item key={i}>
                    <StyledOptions.Item.Button
                      onClick={() => onSubmit(character)}
                    >
                      {character.id.name}
                    </StyledOptions.Item.Button>
                  </StyledOptions.Item>
                ))}
              </StyledOptions>
            )}
          </React.Fragment>
        )}
      </Widget>
    )
  }
}

class FateManager extends React.Component {
  state = {
    selectedCharacter: null
  }
  _handleCharacterSubmit = selectedCharacter => {
    this.setState({ selectedCharacter })
  }
  _handleCharacterChangeRequest = () => {
    this.setState({ selectedCharacter: null })
  }
  render() {
    const { ...wrapperProps } = this.props
    const { selectedCharacter } = this.state
    return (
      <Widget title="Fate manager" {...wrapperProps}>
        {!selectedCharacter ? (
          <FateCharacterManager onSubmit={this._handleCharacterSubmit} />
        ) : (
          <React.Fragment>
            <header>
              You are playing with: <b>{selectedCharacter.id.name}</b>&nbsp;
              <StyledButton onClick={this._handleCharacterChangeRequest}>
                Change character
              </StyledButton>
            </header>
            <FateDiceRoller skills={selectedCharacter.skills} />
          </React.Fragment>
        )}
      </Widget>
    )
  }
}

export default FateManager
