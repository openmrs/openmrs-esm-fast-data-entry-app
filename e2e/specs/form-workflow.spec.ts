import { type APIRequestContext, expect } from '@playwright/test';
import { test } from '../core';

type OpenmrsSessionResponse = {
  user: {
    uuid: string;
  };
};

type OpenmrsForm = {
  uuid: string;
  name?: string;
  published?: boolean;
};

type OpenmrsFormResponse = {
  results?: Array<OpenmrsForm>;
};

type FhirPatient = {
  id: string;
  name?: Array<{
    given?: Array<string>;
    family?: string;
  }>;
  identifier?: Array<{
    value?: string;
  }>;
};

type FhirBundle<T> = {
  entry?: Array<{
    resource: T;
  }>;
};

const workflowStorageVersion = '1.1.0';
const workflowStorageName = 'openmrs:fastDataEntryWorkflowState';
const formRepresentation =
  '(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))';

const getPatientName = (patient: FhirPatient) =>
  `${patient.name?.[0]?.given?.join(' ') ?? ''} ${patient.name?.[0]?.family ?? ''}`.trim();

const getPatientIdentifier = (patient: FhirPatient) => patient.identifier?.[0]?.value?.trim() ?? '';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function getAdminUserUuid(api: APIRequestContext) {
  const response = await api.get('session');
  expect(response.ok()).toBeTruthy();

  const session = (await response.json()) as OpenmrsSessionResponse;
  return session.user.uuid;
}

async function getTestFormUuid(api: APIRequestContext) {
  const response = await api.get(`form?v=custom:${formRepresentation}`);
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as OpenmrsFormResponse;
  const form = payload.results?.find((candidate) => candidate.published && !/component/i.test(candidate.name ?? ''));

  expect(form?.uuid, 'Expected at least one published non-component form').toBeTruthy();
  return form.uuid;
}

async function getTwoPatients(api: APIRequestContext) {
  const response = await api.get(`${process.env.E2E_BASE_URL}/ws/fhir2/R4/Patient?_count=20`);
  expect(response.ok()).toBeTruthy();

  const bundle = (await response.json()) as FhirBundle<FhirPatient>;
  const patients =
    bundle.entry
      ?.map(({ resource }) => resource)
      .filter((patient) => getPatientName(patient) && getPatientIdentifier(patient)) ?? [];

  const uniquePatients = patients.filter(
    (patient, index) =>
      patients.findIndex((candidate) => candidate.id === patient.id) === index &&
      patients.findIndex((candidate) => getPatientIdentifier(candidate) === getPatientIdentifier(patient)) === index,
  );

  expect(uniquePatients.length, 'Expected at least two patients with names and identifiers').toBeGreaterThanOrEqual(2);
  return uniquePatients.slice(0, 2);
}

test('switches active patients from the workflow side panel and persists the selection', async ({ page, api }) => {
  const [userUuid, formUuid, [firstPatient, secondPatient]] = await Promise.all([
    getAdminUserUuid(api),
    getTestFormUuid(api),
    getTwoPatients(api),
  ]);

  const storageKey = `${workflowStorageName}:${userUuid}`;
  const storageValue = JSON.stringify({
    _storageVersion: workflowStorageVersion,
    activeFormUuid: formUuid,
    userUuid,
    forms: {
      [formUuid]: {
        workflowState: 'EDIT_FORM',
        activePatientUuid: firstPatient.id,
        activeEncounterUuid: null,
        patientUuids: [firstPatient.id, secondPatient.id],
        encounters: {},
      },
    },
  });

  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.clear();
      window.localStorage.setItem(key, value);
    },
    { key: storageKey, value: storageValue },
  );

  await page.goto(`forms/form/${formUuid}`);

  await expect(page.getByText('Forms filled')).toBeVisible();

  const firstPatientCard = page.getByRole('button', {
    name: new RegExp(escapeRegExp(getPatientIdentifier(firstPatient))),
  });
  const secondPatientCard = page.getByRole('button', {
    name: new RegExp(escapeRegExp(getPatientIdentifier(secondPatient))),
  });

  await expect(firstPatientCard).toBeVisible();
  await expect(secondPatientCard).toBeVisible();

  await secondPatientCard.click();

  await expect
    .poll(async () => {
      return page.evaluate(
        ({ key, currentFormUuid }) => {
          const data = JSON.parse(window.localStorage.getItem(key) ?? '{}');
          return data.forms?.[currentFormUuid]?.activePatientUuid ?? null;
        },
        { key: storageKey, currentFormUuid: formUuid },
      );
    })
    .toBe(secondPatient.id);

  await firstPatientCard.click();

  await expect
    .poll(async () => {
      return page.evaluate(
        ({ key, currentFormUuid }) => {
          const data = JSON.parse(window.localStorage.getItem(key) ?? '{}');
          return data.forms?.[currentFormUuid]?.activePatientUuid ?? null;
        },
        { key: storageKey, currentFormUuid: formUuid },
      );
    })
    .toBe(firstPatient.id);
});
