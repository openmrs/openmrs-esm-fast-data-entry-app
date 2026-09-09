import { defineConfigSchema, getAsyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-fast-data-entry-app';

const options = {
  featureName: 'fast-data-entry-app',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getAsyncLifecycle(() => import('./Root'), options);

export const formsAppMenuLink = getAsyncLifecycle(() => import('./forms-app-menu-link'), options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/forms`,
      title: 'Forms',
      parent: `${window.spaBase}/home`,
    },
  ]);
}

export const cancelSessionModal = getAsyncLifecycle(() => import('./cancel-session.modal'), options);
export const completeSessionModal = getAsyncLifecycle(() => import('./complete-session.modal'), options);
export const addGroupModal = getAsyncLifecycle(() => import('./add-group-modal/add-group.modal'), options);
export const patientLocationMismatchModal = getAsyncLifecycle(
  () => import('./form-entry-workflow/patient-search-header/patient-location-mismatch.modal'),
  options,
);
