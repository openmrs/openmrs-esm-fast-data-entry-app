import {
  getAsyncLifecycle,
  defineConfigSchema,
  registerBreadcrumbs,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

const moduleName = "@openmrs/esm-fast-data-entry-app";

const options = {
  featureName: "fast-data-entry-app",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export const root = getAsyncLifecycle(() => import("./root"), options);

export const formsAppMenuLink = getAsyncLifecycle(
  () => import("./forms-app-menu-link"),
  options
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/forms`,
      title: "Forms",
      parent: `${window.spaBase}/home`,
    },
  ]);
}
