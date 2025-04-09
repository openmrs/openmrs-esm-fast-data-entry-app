import React from 'react';

import {PageNotFound} from './PageNotFound';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { appPath } from './constant';
const FormsPage = React.lazy(() => import('./forms-page'));
const FormEntryWorkflow = React.lazy(() => import('./form-entry-workflow'));
const GroupFormEntryWorkflow = React.lazy(() => import('./group-form-entry-workflow'));

const Root = () => {
  return (
    <main>
      <BrowserRouter basename={appPath}>
        <Routes>
          <Route path="/" element={<FormsPage />} />
          <Route path="/form/:formUuid" element={<FormEntryWorkflow />} />
          <Route path="/groupform/:formUuid" element={<GroupFormEntryWorkflow />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Root;
