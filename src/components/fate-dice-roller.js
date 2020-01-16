import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { StyledBox } from "./design-system";
import Widget from "./widget";
import * as Helpers from "../helpers";
import { DEFAULT_SIZE } from "./fate-die";
import FateDice from "./fate-dice";

const DICE_COUNT = 4;

const StyledBoard = styled.span`
  display: inline-flex;
  align-items: center;
`;

const StyledText = styled.span`
  line-height: ${DEFAULT_SIZE}px;
  font-size: ${Math.floor((DEFAULT_SIZE * 3) / 4)}px;
`;

function DiceRollerWidget(props) {
  const {
    dice,
    selectedSkill,
    rollId,
    onDieSelect,
    rerollCount,
    onSelectedDiceReroll,
    onRoll,
    onClear,
    ...wrapperProps
  } = props;
  const diceValue = (dice || []).reduce(
    (finalValue, { value }) =>
      finalValue + (value < 3 ? -1 : value > 4 ? 1 : 0),
    0
  );
  const finalValue = diceValue + (selectedSkill ? selectedSkill.value : 0);
  const someSelectedDice = (dice || []).some(x => x.selected);
  return (
    <Widget
      {...wrapperProps}
      title={
        selectedSkill
          ? `${selectedSkill.name} +${selectedSkill.value}`
          : "--No selected skill--"
      }
      commands={[
        { title: "Clear", onInvoke: onClear, key: "clear" },
        {
          title: dice ? "New roll" : "Roll!",
          onInvoke: onRoll,
          key: "roll",
          primary: true
        }
      ].concat(
        someSelectedDice
          ? {
              title: "re-roll selected dice",
              onInvoke: onSelectedDiceReroll,
              key: "reroll",
              primary: true
            }
          : []
      )}
    >
      {!dice ? (
        <React.Fragment>
          <StyledText>Roll the dice!</StyledText>
        </React.Fragment>
      ) : (
        <StyledBoard>
          <FateDice rollId={rollId} dice={dice} onDieSelect={onDieSelect} />
          <StyledText>
            &nbsp;=&nbsp;
            {`${diceValue}${
              selectedSkill ? ` + ${selectedSkill.value} = ${finalValue}` : ""
            }`}
          </StyledText>
          <span>(Re-rolls: {rerollCount})</span>
        </StyledBoard>
      )}
    </Widget>
  );
}

class FateDiceRoller extends React.Component {
  static propTypes = {
    skills: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired
      })
    )
  };
  state = {
    dice: null,
    rollCount: 0,
    rerollCount: 0,
    selectedSkillIndex: -1
  };
  _handleRoll = e => {
    this.setState(prevState => ({
      dice: Array.from({ length: DICE_COUNT }).map((x, index) => ({
        value: getRandomDieValue(),
        rerollCount: 0,
        selected: false
      })),
      rollCount: prevState.rollCount + 1,
      rerollCount: 0
    }));
  };
  _handleSelectedDiceReroll = e => {
    this.setState(prevState => ({
      dice: prevState.dice.map(x =>
        x.selected
          ? {
              value: getRandomDieValue(),
              rerollCount: x.rerollCount + 1,
              selected: false
            }
          : x
      ),
      rerollCount: prevState.rerollCount + 1
    }));
  };
  _handleClear = e => {
    this.setState({ dice: null });
  };
  _handleDieSelect = index => {
    this.setState(prevState => ({
      dice: Helpers.modifyArrayElement(prevState.dice, index, currentDie => ({
        ...currentDie,
        selected: !currentDie.selected
      }))
    }));
  };
  _handleSelectedSkillIndexChange = e => {
    const { selectedSkillIndex: currentSelectedSkillIndex } = this.state;
    const selectedSkillIndex = Number(e.currentTarget.value);
    if (currentSelectedSkillIndex !== selectedSkillIndex) {
      this.setState({ selectedSkillIndex, dice: null, rollCount: 0 });
    }
  };
  render() {
    const { skills } = this.props;
    const { dice, rollCount, rerollCount, selectedSkillIndex } = this.state;
    const selectedSkill = skills[selectedSkillIndex];
    return (
      <StyledBox {...this.props}>
        <DiceRollerWidget
          dice={dice}
          selectedSkill={selectedSkill}
          onRoll={this._handleRoll}
          onDieSelect={this._handleDieSelect}
          onSelectedDiceReroll={this._handleSelectedDiceReroll}
          onClear={this._handleClear}
          rollId={`${selectedSkillIndex}-${rollCount}`}
          rerollCount={rerollCount}
        />
        <StyledBox>
          <header>Skills</header>
          <ul>
            {[{ name: "--None--", value: 0 }, ...skills].map((x, i) => (
              <li key={i}>
                <label>
                  <input
                    name="skill"
                    value={i - 1}
                    checked={selectedSkillIndex === i - 1}
                    type="radio"
                    onChange={this._handleSelectedSkillIndexChange}
                  />
                  <span>{`${x.name} (+${x.value})`}</span>
                </label>
              </li>
            ))}
          </ul>
        </StyledBox>
      </StyledBox>
    );
  }
}

export default FateDiceRoller;

function getRandomDieValue() {
  return 1 + Math.floor(Math.random() * 6);
}
