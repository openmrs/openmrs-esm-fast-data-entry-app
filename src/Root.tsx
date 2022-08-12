import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { appPath } from "./constant";
const FormsPage = React.lazy(() => import("./forms-page"));
const FormEntryWorkflow = React.lazy(() => import("./form-entry-workflow"));

const Root = () => {
  return (
    <main>
      <BrowserRouter basename={appPath}>
        <Routes>
          <Route path="" element={<FormsPage />} />
          <Route path="/:formUuid" element={<FormEntryWorkflow />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
