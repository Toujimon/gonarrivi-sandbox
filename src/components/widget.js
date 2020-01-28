import React from "react";
import styled from "styled-components";
import { Paper } from "@material-ui/core";
import { StyledButton, theme } from "./design-system";

const StyledWrapper = styled(Paper)`
  display: flex;
  flex-direction: column;
  overflow: auto;
  box-sizing: border-box;
  width: 100%;
`;
const footerHeaderStyles = `
  height: 40px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
`;
const StyledHeader = styled.header`
  ${footerHeaderStyles}
  ${({ theme }) => `
  background-color: ${theme.primary};
  color: ${theme.textOverPrimary};
  `}
  padding: 0 8px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
`;
StyledHeader.defaultProps = { theme };
const StyledContent = styled.div`
  padding: 8px;
  flex: 1 1 auto;
  height: 100%;
  overflow: auto;
`;
const StyledFooter = styled.footer`
  ${footerHeaderStyles}
  border-top: 1px solid black;
  justify-content: flex-end;
`;

const StyledCommand = styled(StyledButton)`
  border-radius: 0;
  align-self: stretch;
  border: 0;
  border-left: 1px solid rgba(0, 0, 0, 0.5);
`;

function Widget(props) {
  const { children, title, commands, ...wrapperProps } = props;
  return (
    <StyledWrapper {...wrapperProps}>
      {!!title && <StyledHeader>{title}</StyledHeader>}
      <StyledContent>{children}</StyledContent>
      {!!commands && !!commands.length && (
        <StyledFooter>
          {commands.map(({ title, onInvoke, key, ...otherProps }, i) => (
            <StyledCommand
              key={key || i}
              title={title}
              onClick={onInvoke}
              {...otherProps}
            >
              {title}
            </StyledCommand>
          ))}
        </StyledFooter>
      )}
    </StyledWrapper>
  );
}

export default Widget;
