import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { appPath } from "./constant";
const FormsRoot = React.lazy(() => import("./forms/FormsRoot"));
const FormWorkflow = React.lazy(() => import("./forms/FormWorkflow"));

const Root = () => {
  return (
    <main>
      <BrowserRouter basename={appPath}>
        <Switch>
          <Route exact path="/" children={<FormsRoot />} />
          <Route path="/:formUuid?" children={<FormWorkflow />} />
        </Switch>
      </BrowserRouter>
    </main>
  );
};

export default Root;
