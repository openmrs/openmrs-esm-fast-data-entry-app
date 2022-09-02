import React from "react";
import { render } from "@testing-library/react";
import GroupBanner from "./GroupBanner";

describe("PatientBanner", () => {
  it("renders placeholder information when no data is present", () => {
    render(<GroupBanner />);
  });
});
