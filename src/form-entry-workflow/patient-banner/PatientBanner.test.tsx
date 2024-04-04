import React from 'react';
import { render } from '@testing-library/react';
import PatientBanner from './PatientBanner';

describe('PatientBanner', () => {
  it('renders placeholder information when no data is present', () => {
    render(<PatientBanner />);
  });
});
