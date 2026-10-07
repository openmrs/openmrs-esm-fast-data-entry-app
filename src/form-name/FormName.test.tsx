import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFormName } from '../hooks/useFormName';
import FormName from './FormName';

vi.mock('../hooks/useFormName', () => ({
  useFormName: vi.fn(),
}));

const mockUseFormName = vi.mocked(useFormName);

describe('FormName', () => {
  it('shows the form name with its full text on hover in the inline variant', () => {
    mockUseFormName.mockReturnValue('Covid 19');

    render(<FormName formUuid="form-uuid" variant="inline" />);

    expect(mockUseFormName).toHaveBeenCalledWith('form-uuid');
    expect(screen.getByText('Covid 19')).toHaveAttribute('title', 'Covid 19');
  });

  it('labels the form name in the panel variant', () => {
    mockUseFormName.mockReturnValue('Covid 19');

    render(<FormName formUuid="form-uuid" variant="panel" />);

    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByText('Covid 19')).toBeInTheDocument();
  });

  it('renders nothing until the form name has loaded', () => {
    mockUseFormName.mockReturnValue(undefined);

    const { container } = render(<FormName formUuid="form-uuid" variant="inline" />);

    expect(container).toBeEmptyDOMElement();
  });
});
