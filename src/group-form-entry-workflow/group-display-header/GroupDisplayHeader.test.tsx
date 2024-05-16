import React from 'react';
import { render } from '@testing-library/react';
import GroupDisplayHeader from './GroupDisplayHeader';

describe('PatientBanner', () => {
  it('renders placeholder information when no data is present', () => {
    render(<GroupDisplayHeader />);
  });
});
