import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const StyledWrapper = styled.div`
  border: 1px solid black;
`;
const StyledTabList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  :after {
    content: '';
    flex: 1 1 auto;
    border-bottom: 1px solid grey;
  }
`;
const StyledTab = styled.li`
  border: 1px solid grey;
`;
class TabbedContainer extends React.Component {
  static propTypes = {
    tabs: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired
  };
  state = {
    selectedTab: 0
  };
  // _handleClick = e => {
  //   e.preventDefault();
  //   console.log("something");
  //   const selectedTab = Number(/#(\d)+/.exec(e.currentTarget.href)[1]);
  //   this.setState({ selectedTab });
  // };
  render() {
    const { tabs = [], children = () => null } = this.props;
    const { selectedTab } = this.state;
    return (
      <StyledWrapper>
        <nav>
          <StyledTabList>
            {tabs.map((x, i) => (
              <StyledTab key={i}>
                {i !== selectedTab ? (
                  <button onClick={e => this.setState({ selectedTab: i })}>
                    {x}
                  </button>
                ) : (
                  x
                )}
              </StyledTab>
            ))}
          </StyledTabList>
        </nav>
        <div>
          {tabs.length &&
            typeof children === "function" &&
            children(selectedTab)}
        </div>
      </StyledWrapper>
    );
  }
}

const testTabs = ["TAB 1", "TAB 2", "...", "otro"];
const test = () => (
  <TabbedContainer tabs={testTabs}>
    {selectedTab => {
      switch (selectedTab) {
        case 0:
          return <span>La primera tab</span>;
        case 1:
          return <span>Hay mas tabs</span>;
        case 2:
          return (
            <React.Fragment>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
              <p>asdfasdfasdfasdfasdfasdf</p>
            </React.Fragment>
          );
        default:
          return <span>Cualquier cosa</span>;
      }
    }}
  </TabbedContainer>
);

export default test;
