import * as React from "react";
import { action } from "@storybook/addon-actions";
import FateDice from "./fate-dice";

export default {
  component: FateDice,
  title: "Fate Dice"
};

export const SomeDice = () => (
  <FateDice
    dice={[
      { value: 1, selected: false },
      { value: 3, selected: false },
      { value: 5, selected: true }
    ]}
    onDieSelect={action("Die selected")}
  />
);
