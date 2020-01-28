import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Paper } from "@material-ui/core";
import { StyledBox } from "./design-system";
import Widget from "./widget";
import { modifyArrayElement } from "../helpers";

const SKILLS_PIRAMID_TOP = 4;

const HiddenStyledBox = styled(StyledBox)`
  display: none;
`;

const StyledFieldSet = props => <Paper {...props} />;

class FateCharacterSheet extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    defaultValues: PropTypes.object
  };
  state = {
    id: {
      name: "",
      description: ""
    },
    aspects: {
      highConcept: null,
      problem: null,
      others: []
    },
    skills: Array.from({ length: SKILLS_PIRAMID_TOP }).reduce((acc, x, i) => {
      return acc.concat(
        Array.from({ length: i + 1 }).map((y, j) => ({
          value: SKILLS_PIRAMID_TOP - i,
          name: ""
        }))
      );
    }, []),
    stunts: [],
    extras: [],
    stressTracks: { physical: 2, mental: 2 },
    consequences: [null, null, null],
    ...this.props.defaultValues
  };
  _handleNameChange = ev => {
    const name = ev.currentTarget.value;
    this.setState(prevState => ({ id: { ...prevState.id, name } }));
  };
  _handleSkillNameChange = (i, ev) => {
    const name = ev.currentTarget.value;
    this.setState(prevState => ({
      skills: modifyArrayElement(prevState.skills, i, curElement => ({
        ...curElement,
        name
      }))
    }));
  };
  _handleSubmit = event => {
    const { onSubmit } = this.props;
    event.preventDefault();
    onSubmit &&
      onSubmit(
        { ...this.state, skills: this.state.skills.filter(x => x.name) },
        event
      );
  };
  render() {
    const { onSubmit, defaultValues, ...wrapperProps } = this.props;
    const {
      id,
      //aspects,
      skills
      //stunts,
      //extras,
      //stressTracks,
      //consequences
    } = this.state;
    const groupedSkills = skills.reduce((acc, skill, i) => {
      if (!acc[skill.value]) {
        acc[skill.value] = [];
      }
      acc[skill.value].push({ id: i, name: skill.name });
      return acc;
    }, {});
    return (
      <Widget
        {...wrapperProps}
        commands={[{ title: "Save", onInvoke: this._handleSubmit }]}
      >
        <form onSubmit={this._handleSubmit}>
          <StyledFieldSet>
            <header>Id</header>
            <label>
              <input
                type="text"
                placeholder="Name"
                value={id.name}
                onChange={this._handleNameChange}
              />
            </label>
          </StyledFieldSet>
          <HiddenStyledBox>
            <header>Aspects</header>
            <div>Aspects component</div>
          </HiddenStyledBox>
          <StyledBox>
            <header>Skills</header>
            <ul>
              {Object.keys(groupedSkills)
                .sort((a, b) => 0 + b - a)
                .map(key => (
                  <li key={key}>
                    + {key}
                    <ul>
                      {groupedSkills[key].map(item => (
                        <li key={item.id}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={ev =>
                              this._handleSkillNameChange(item.id, ev)
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
          </StyledBox>
          <HiddenStyledBox>
            <header>Stunts</header>
            <div>Stunts Component</div>
          </HiddenStyledBox>
          <HiddenStyledBox>
            <header>Extras</header>
            <div>Extras Component</div>
          </HiddenStyledBox>
          <HiddenStyledBox>
            <header>Stress</header>
            <div>Stress Component</div>
          </HiddenStyledBox>
          <HiddenStyledBox>
            <header>Consequences</header>
            <div>Consequences Component</div>
          </HiddenStyledBox>
        </form>
      </Widget>
    );
  }
}

export default FateCharacterSheet;
