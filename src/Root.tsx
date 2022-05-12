import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { appPath } from "./constant";
import FormsRoot from "./forms/FormsRoot";

const Root = () => {
  return (
    <main>
      <BrowserRouter basename={appPath}>
        <Route path="/:tab?" component={FormsRoot} />
      </BrowserRouter>
    </main>
  );
};

export default Root;
