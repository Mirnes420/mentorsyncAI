import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '../JobList';
import React from 'react';

const mockJob = {
  id: '1',
  title: 'Software Engineer',
  company: 'Tech Corp',
  location: 'San Francisco',
  description: 'A great job for a great engineer.',
  job_url: 'https://example.com/job/1',
  job_type: 'Full-time',
  site: 'Adzuna'
};

describe('JobCard', () => {
  it('renders job title and company', () => {
    render(<JobCard job={mockJob} onSelectJob={() => {}} />);
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('shows "View Full Description" button if description is long', () => {
    const longJob = { ...mockJob, description: 'A'.repeat(200) };
    render(<JobCard job={longJob} onSelectJob={() => {}} />);
    
    expect(screen.getByText(/View Full Description/i)).toBeInTheDocument();
  });

  it('calls onSelectJob when "Tailor CV" button is clicked', () => {
    const onSelectJob = vi.fn();
    render(<JobCard job={mockJob} onSelectJob={onSelectJob} />);
    
    const button = screen.getByText(/Tailor CV for this Job/i);
    fireEvent.click(button);
    
    expect(onSelectJob).toHaveBeenCalledWith(mockJob);
  });
});
