import { Tab, Tabs } from "carbon-components-react";
import React from "react";
import FormsTable from "./FormsTable";

const FormsRoot = ({ match }) => {
  const { tab } = match?.params;
  return (
    <div style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Forms</h3>
      <Tabs type="container">
        <Tab label="All Forms">
          <FormsTable />
        </Tab>
        <Tab label="ICRC Forms">
          <FormsTable />
        </Tab>
        <Tab label="Distress Scales">
          <FormsTable />
        </Tab>
        <Tab label="Functioning Scales">
          <FormsTable />
        </Tab>
        <Tab label="Coping Scales">
          <FormsTable />
        </Tab>
      </Tabs>
    </div>
  );
};

export default FormsRoot;
export { FormsRoot };
