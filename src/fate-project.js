import React from "react";
import { Route, Link } from "react-router-dom";
import styled from "styled-components";
import { StyledBox } from "./components/design-system";
import LineClamper from "./components/line-clamper";
import FateManager from "./components/fate-manager";

const StyledList = styled.ul`
  margin: 0;
`;

class FateProject extends React.Component {
  state = {
    strSkills: (() => {
      if (localStorage) {
        const strFateCoreSkillTable = localStorage.getItem(
          "FATE_CORE_SKILLS_TABLE"
        );
        return strFateCoreSkillTable || null;
      }
      return null;
    })()
  };
  _canSetState = true;
  componentDidMount() {
    const { strSkills } = this.state;
    if (strSkills === null) {
      fetch("https://fate-srd.com/fate-core/default-skill-list")
        .then(response => response.text())
        .then(text => new DOMParser().parseFromString(text, "text/html"))
        .then(doc => {
          const elFateCoreSkillTable = doc.querySelector(".skill-list");
          if (elFateCoreSkillTable) {
            const strFateCoreSkillTable = elFateCoreSkillTable.innerHTML;
            if (localStorage) {
              localStorage.setItem(
                "FATE_CORE_SKILLS_TABLE",
                strFateCoreSkillTable
              );
            }
            if (this._canSetState) {
              this.setState({ strSkills: strFateCoreSkillTable });
            }
          } else {
            throw new Error("FATE CORE skill table element not found");
          }
        })
        .catch(e => {
          console.error(e);
          this.setState({ strSkills: "" });
        });
    }
  }
  componentWillUnmount() {
    this._canSetState = false;
  }
  render() {
    const { match } = this.props;
    const { strSkills } = this.state;
    return (
      <React.Fragment>
        <h2>FATE CORE Utils</h2>
        <p>
          A little project to test the different libraries and React related
          technologies with a more specific target in mind, in this case, utility 
          tools for the FATE CORE role-playing-game system.
        </p>
        <StyledBox>
          <h3>Some use cases to cover</h3>
          <LineClamper maxLines={2}>
            <StyledList>
              <li>Create new character</li>
              <li>Set a created character as the current character</li>
              <li>Unset the current character</li>
              <li>
                Make skill check (throw dice) using one of the current
                character's skills
              </li>
              <li>Re-roll some dice from current skill check</li>
              <li>Add bonus to current skill check</li>
            </StyledList>
          </LineClamper>
        </StyledBox>
        {strSkills !== null ? <FateManager /> : "Something is loading..."}
      </React.Fragment>
    );
  }
}

export default FateProject;
