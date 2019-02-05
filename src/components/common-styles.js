import { keyframes } from "styled-components";

// keyframes
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(56px);
    margin-bottom: -24px;
  }
  to {
    opacity: 1;
    transform: translateX(0);
    margin-bottom: 0;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
    margin-bottom: 0;
  }
  to {
    opacity: 0;
    transform: translateX(-56px);
    margin-bottom: -24px;
  }
`;
