import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GroupFormWorkflowContext from '../context/GroupFormWorkflowContext';
import useSpecificQuestions from '../hooks/useSpecificQuestions';
import SessionMetaWorkspace from './SessionMetaWorkspace';

// flatpickr can't load its locales under vitest, so this stands in for Carbon's DatePicker and reports
// the picked date the way flatpickr does: as an array of Date objects.
vi.mock('@carbon/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@carbon/react')>();
  return {
    ...actual,
    DatePicker: React.forwardRef<
      HTMLDivElement,
      { children: React.ReactNode; onChange?: (dates: Array<Date>) => void }
    >(({ children, onChange }, ref) => (
      <div ref={ref} onChange={(event) => onChange?.([new Date((event.target as HTMLInputElement).value)])}>
        {children}
      </div>
    )),
  };
});

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

vi.mock('react-router-dom', () => ({
  useParams: () => ({ formUuid: 'form-1' }),
}));

vi.mock('../form-name/FormName', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('../hooks/useGetPatients', () => ({
  __esModule: true,
  default: () => ({ patients: [], isLoading: false }),
}));

vi.mock('./attendance-table', () => ({
  AttendanceTable: () => null,
}));

vi.mock('../hooks/useSpecificQuestions', () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockUseConfig = vi.mocked(useConfig);
const mockUseSpecificQuestions = vi.mocked(useSpecificQuestions);

const specificQuestions = [
  {
    question: { id: 'venue', display: 'Venue', defaultAnswer: 'Community hall' },
    answers: [],
  },
  {
    question: { id: 'sessionType', display: 'Session type' },
    answers: [
      { value: 'concept-individual', display: 'Individual' },
      { value: 'concept-group', display: 'Group' },
    ],
  },
  {
    question: { id: 'programme', display: 'Programme', defaultAnswer: 'concept-hiv', disabled: true },
    answers: [
      { value: 'concept-hiv', display: 'HIV' },
      { value: 'concept-tb', display: 'TB' },
    ],
  },
];

const renderSessionForm = (contextOverrides = {}) =>
  render(
    <GroupFormWorkflowContext.Provider
      value={
        {
          workflowState: 'NEW_GROUP_SESSION',
          activeFormUuid: 'form-1',
          activeGroupUuid: 'group-1',
          activeGroupMembers: [],
          patientUuids: ['patient-a'],
          setSessionMeta: vi.fn(),
          ...contextOverrides,
        } as never
      }
    >
      <SessionMetaWorkspace />
    </GroupFormWorkflowContext.Provider>,
  );

// The text fields share an id, so their labels all point at the first one. Find them by name instead.
const getField = (name: string) => screen.getAllByRole('textbox').find((field) => field.getAttribute('name') === name);

describe('SessionDetailsForm', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ specificQuestions: [] });
    mockUseSpecificQuestions.mockReturnValue({ questions: [], isError: undefined, isLoading: false });
  });

  it('flags the required text fields and does not submit when the form is empty', async () => {
    const user = userEvent.setup();
    const setSessionMeta = vi.fn();

    renderSessionForm({ setSessionMeta });

    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => expect(getField('sessionName')).toHaveAttribute('aria-invalid', 'true'));
    expect(getField('practitionerName')).toHaveAttribute('aria-invalid', 'true');
    expect(getField('sessionNotes')).toHaveAttribute('aria-invalid', 'true');
    expect(setSessionMeta).not.toHaveBeenCalled();
  });

  it('does not submit until a session date is picked', async () => {
    const user = userEvent.setup();
    const setSessionMeta = vi.fn();

    renderSessionForm({ setSessionMeta });

    await user.type(getField('sessionName'), 'April Session');
    await user.type(getField('practitionerName'), 'Alice');
    await user.type(getField('sessionNotes'), 'Bring notebooks');
    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    expect(setSessionMeta).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Session Date'), '04/15/2026');
    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => expect(setSessionMeta).toHaveBeenCalledTimes(1));
  });

  it('submits the filled session details with the picked date and the group', async () => {
    const user = userEvent.setup();
    const setSessionMeta = vi.fn();

    renderSessionForm({ setSessionMeta });

    await user.type(getField('sessionName'), 'April Session');
    await user.type(getField('practitionerName'), 'Alice');
    await user.type(screen.getByLabelText('Session Date'), '04/15/2026');
    await user.tab();
    await user.type(getField('sessionNotes'), 'Bring notebooks');
    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => expect(setSessionMeta).toHaveBeenCalledTimes(1));
    const payload = setSessionMeta.mock.calls[0][0];
    expect(payload).toEqual({
      groupUuid: 'group-1',
      sessionName: 'April Session',
      practitionerName: 'Alice',
      sessionDate: expect.any(Date),
      sessionNotes: 'Bring notebooks',
    });
    expect(payload.sessionDate.toISOString()).toBe('2026-04-15T00:00:00.000Z');
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });

  it('includes the specific question answers, defaults and read-only values in the payload', async () => {
    const user = userEvent.setup();
    const setSessionMeta = vi.fn();
    mockUseSpecificQuestions.mockReturnValue({
      questions: specificQuestions,
      isError: undefined,
      isLoading: false,
    });

    renderSessionForm({ setSessionMeta });

    expect(screen.getByLabelText('Venue')).toHaveValue('Community hall');
    expect(screen.getByLabelText('Programme')).toHaveValue('concept-hiv');

    await user.type(getField('sessionName'), 'April Session');
    await user.type(getField('practitionerName'), 'Alice');
    await user.type(screen.getByLabelText('Session Date'), '04/15/2026');
    await user.tab();
    await user.type(getField('sessionNotes'), 'Bring notebooks');
    await user.selectOptions(screen.getByLabelText('Session type'), 'concept-group');
    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => expect(setSessionMeta).toHaveBeenCalledTimes(1));
    expect(setSessionMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        groupUuid: 'group-1',
        venue: 'Community hall',
        sessionType: 'concept-group',
        programme: 'concept-hiv',
      }),
    );
  });

  it('submits an empty string for an optional specific question left blank', async () => {
    const user = userEvent.setup();
    const setSessionMeta = vi.fn();
    mockUseSpecificQuestions.mockReturnValue({
      questions: specificQuestions,
      isError: undefined,
      isLoading: false,
    });

    renderSessionForm({ setSessionMeta });

    await user.type(getField('sessionName'), 'April Session');
    await user.type(getField('practitionerName'), 'Alice');
    await user.type(screen.getByLabelText('Session Date'), '04/15/2026');
    await user.tab();
    await user.type(getField('sessionNotes'), 'Bring notebooks');
    await user.click(screen.getByRole('button', { name: 'Create New Session' }));

    await waitFor(() => expect(setSessionMeta).toHaveBeenCalledTimes(1));
    expect(setSessionMeta.mock.calls[0][0].sessionType).toBe('');
  });
});
