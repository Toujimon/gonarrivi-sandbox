import styled from "styled-components";
import { Paper } from "@material-ui/core";
import { darken, transparentize } from "polished";

export const theme = {
  primary: "blue",
  textOverPrimary: "white",
  secondary: "violet",
  textOverSecondary: "white",
  fontFamily: "'Roboto', sans-serif"
};

const layoutInitialMarginDirection = layout =>
  layout === "column" ? "top" : "left";
export const layoutPropsStyles = ({ layout = "column", separation = 8 }) =>
  layout
    ? `
  display: flex;
  flex-direction: ${layout};
  > *:first-child {
    margin-${layoutInitialMarginDirection(layout)}: 0;
  }
  ${
    separation
      ? `
  > *:not(:first-child) {
    margin-${layoutInitialMarginDirection(layout)}: ${separation}px;
  `
      : ""
  }}
`
    : "";

export const StyledBox = styled(Paper)`
  padding: ${props => (props.compact ? 8 : 16)}px;
  ${layoutPropsStyles}
`;

export const StyledButton = styled.button`
  cursor: pointer;
  ${({ primary, secondary, theme }) => {
    const [background, color, border] = primary
      ? [theme.primary, theme.textOverPrimary, ""]
      : secondary
      ? [theme.secondary, theme.textOverSecondary, ""]
      : ["", theme.primary, theme.primary];

    return `
  background-color: ${background || "transparent"};
  color: ${color};
  border: ${border ? `2px solid ${border}` : "0"};
  :hover, :focus {
    ${background ? `background-color: ${darken(0.2, background)};` : ""}
    ${color ? `color: ${darken(0.2, color)};` : ""}
    ${border ? `border-color: ${darken(0.2, border)};` : ""}
  }
  :disabled {
    cursor: not-allowed;
    ${background ? `background-color: ${transparentize(0.3, background)};` : ""}
    ${color ? `color: ${transparentize(0.3, color)};` : ""}
    ${border ? `border-color: ${transparentize(0.3, border)};` : ""}
  }
      `;
  }}
  border-radius: 4px;
  padding: 2px 7px;
  text-transform: uppercase;
  line-height: 12px;
  font-family: ${({ theme }) => theme.fontFamily};
  transition: all 200ms ease-in;
`;
StyledButton.defaultProps = { theme };

export const StyledGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  overflow: hidden;
`;

export const RESPONSIVE_SIZES = {
  SMALL: "xs",
  MEDIUM: "md",
  LARGE: "lg"
};
const RESPONSIVE_SIZES_PRIORITIES = {
  [RESPONSIVE_SIZES.SMALL]: 1,
  [RESPONSIVE_SIZES.MEDIUM]: 2,
  [RESPONSIVE_SIZES.LARGE]: 3
};

function createResponsiveMediaCondition(size) {
  const condition = (() => {
    switch (size) {
      case RESPONSIVE_SIZES.SMALL:
        return "max-width: 767px";
      case RESPONSIVE_SIZES.MEDIUM:
        return "min-width: 768px";
      case RESPONSIVE_SIZES.LARGE:
        return "min-width: 992px";
      default:
        return "";
    }
  })();
  return condition && `@media screen and (${condition})`;
}

const memoizedRulesCreators = {};
export function createResponsiveRule(size) {
  if (!memoizedRulesCreators[size]) {
    const condition = createResponsiveMediaCondition(size);
    memoizedRulesCreators[size] = (strings, ...values) =>
      [
        condition ? condition + " {\n" : "",
        strings.reduce(
          (acc, aString, i) =>
            `${acc}${aString}${i < values.length ? values[i] : ""}`,
          ""
        ),
        condition ? "\n}" : ""
      ].join("");
  }
  return memoizedRulesCreators[size];
}

const cellPropsRegex = /^col-(\d+)(-(xs|md|lg))?$/;
export const asStyledCell = component => styled(component)`
  ${({ color }) => `background-color: ${color};`}
  display: block;
  overflow: auto;
  box-sizing: border-box;
  ${props => {
    const cellRules = Object.keys(props)
      .reduce((cellRules, prop) => {
        const values = cellPropsRegex.exec(prop);
        if (values) {
          const width = values[1],
            size = values[3];
          const cssRule = createResponsiveRule(
            size
          )`flex: 0 0 auto; width: ${(width / 12) * 100}%;`;
          cellRules.push({
            cssRule,
            ruleOrder: RESPONSIVE_SIZES_PRIORITIES[size] || 0
          });
        }
        return cellRules;
      }, [])
      .sort((a, b) => a.ruleOrder - b.ruleOrder);
    return `
      flex: ${cellRules.some(x => x.ruleOrder === 0) ? "0 0 auto" : "1 1 auto"};
      ${cellRules.map(x => x.cssRule).join("\n")}
    `;
  }};
`;
export const StyledCell = asStyledCell("div");
