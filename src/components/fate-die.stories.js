import React from "react";
import { action } from "@storybook/addon-actions";
import FateDie from "./fate-die";

export default {
  component: FateDie,
  title: "Fate Die"
};

export const All_six_sides_from_1_to_6 = () => (
  <React.Fragment>
    <FateDie value={1} />
    <FateDie value={2} />
    <FateDie value={3} />
    <FateDie value={4} />
    <FateDie value={5} />
    <FateDie value={6} />
  </React.Fragment>
);
