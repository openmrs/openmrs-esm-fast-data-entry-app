import React from "react";
import { render } from "@testing-library/react";
import PatientInfo from "./PatientInfo";

describe("PatientInfo", () => {
  it("renders placeholder information when no data is present", () => {
    render(<PatientInfo patientUuid={null} />);
  });
});
