import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DateTimePicker, type DateTimePickerProps, type DateTimeValue } from '../index';

function Picker(props: Partial<DateTimePickerProps> & { onValue?: (v: DateTimeValue) => void }) {
  const [value, setValue] = useState<DateTimeValue>(
    props.value ?? { date: '2026-10-06', time: '09:00' },
  );
  return (
    <DateTimePicker
      timeZone="UTC"
      locale="en-GB"
      {...props}
      value={value}
      onChange={(v) => {
        setValue(v);
        props.onValue?.(v);
      }}
    />
  );
}

// Runtimes differ on the comma after the weekday ("Friday, 9 October 2026").
const day = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`^${name.replace(' ', ',? ')}$`) });
const selected = () =>
  screen
    .getAllByRole('gridcell')
    .filter((c) => c.getAttribute('aria-selected') === 'true')
    .map((c) => c.textContent);

afterEach(() => {
  vi.useRealTimers();
});

describe('DateTimePicker', () => {
  it('shows the value’s month, weeks starting on Monday, with the day selected', () => {
    render(<Picker />);
    expect(screen.getByRole('heading', { name: 'October 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ]);
    // Six weeks, from the Monday before the 1st.
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(42);
    expect(cells[0]).toHaveTextContent('28');
    expect(selected()).toEqual(['6']);
  });

  it('weeks can start on Sunday', () => {
    render(<Picker weekStartsOn={0} />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun');
    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('27');
  });

  it('picking a day keeps the time; changing the time keeps the day', async () => {
    const onValue = vi.fn();
    render(<Picker onValue={onValue} />);
    await userEvent.click(day('Friday 9 October 2026'));
    expect(onValue).toHaveBeenLastCalledWith({ date: '2026-10-09', time: '09:00' });
    expect(selected()).toEqual(['9']);
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '14:30' } });
    expect(onValue).toHaveBeenLastCalledWith({ date: '2026-10-09', time: '14:30' });
  });

  it('a cleared time field keeps the last whole time', () => {
    const onValue = vi.fn();
    render(<Picker onValue={onValue} />);
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '' } });
    expect(onValue).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Time')).toHaveValue('09:00');
  });

  it('days outside the range can’t be picked, and months wholly outside can’t be opened', async () => {
    const onValue = vi.fn();
    render(<Picker minDate="2026-10-05" maxDate="2026-11-10" onValue={onValue} />);
    expect(day('Sunday 4 October 2026')).toBeDisabled();
    expect(day('Monday 5 October 2026')).toBeEnabled();
    await userEvent.click(day('Sunday 4 October 2026'));
    expect(onValue).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Tuesday 10 November 2026')).toBeEnabled();
    expect(day('Wednesday 11 November 2026')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    // Looking at another month doesn't change the value.
    expect(onValue).not.toHaveBeenCalled();
  });

  it('a day of the next month, shown at the end of the grid, opens that month when picked', async () => {
    const onValue = vi.fn();
    render(<Picker onValue={onValue} />);
    await userEvent.click(day('Monday 2 November 2026'));
    expect(onValue).toHaveBeenLastCalledWith({ date: '2026-11-02', time: '09:00' });
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
  });

  it('today is the day in the picker’s timezone, not the browser’s', () => {
    // 23:30 UTC on the 5th is already the 6th in Kolkata (+5:30).
    vi.useFakeTimers({ now: new Date('2026-10-05T23:30:00Z'), toFake: ['Date'] });
    const { unmount } = render(
      <Picker timeZone="Asia/Kolkata" value={{ date: '2026-10-20', time: '09:00' }} />,
    );
    expect(day('Tuesday 6 October 2026, Today')).toHaveAttribute('aria-current', 'date');
    unmount();
    render(<Picker timeZone="UTC" value={{ date: '2026-10-20', time: '09:00' }} />);
    expect(day('Monday 5 October 2026, Today')).toHaveAttribute('aria-current', 'date');
  });

  it('arrow keys move by day and week, Home and End to the week’s ends, Page keys by month', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Picker onValue={onValue} />);
    // Only the selected day is in the tab order.
    expect(day('Tuesday 6 October 2026')).toHaveAttribute('tabindex', '0');
    expect(day('Wednesday 7 October 2026')).toHaveAttribute('tabindex', '-1');
    day('Tuesday 6 October 2026').focus();
    await user.keyboard('{ArrowRight}');
    expect(day('Wednesday 7 October 2026')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day('Wednesday 14 October 2026')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(day('Tuesday 6 October 2026')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(day('Monday 5 October 2026')).toHaveFocus();
    await user.keyboard('{End}');
    expect(day('Sunday 11 October 2026')).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('heading', { name: 'November 2026' })).toBeInTheDocument();
    expect(day('Wednesday 11 November 2026')).toHaveFocus();
    await user.keyboard('{PageUp}{PageUp}');
    expect(day('Friday 11 September 2026')).toHaveFocus();
    // Moving doesn't pick; Enter does.
    expect(onValue).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onValue).toHaveBeenLastCalledWith({ date: '2026-09-11', time: '09:00' });
  });

  it('Page Down from the 31st lands on a shorter month’s last day', async () => {
    const user = userEvent.setup();
    render(<Picker value={{ date: '2027-01-31', time: '09:00' }} />);
    day('Sunday 31 January 2027').focus();
    await user.keyboard('{PageDown}');
    expect(day('Sunday 28 February 2027')).toHaveFocus();
  });

  it('the keyboard stops at the range’s ends', async () => {
    const user = userEvent.setup();
    render(<Picker minDate="2026-10-05" maxDate="2026-10-08" />);
    day('Tuesday 6 October 2026').focus();
    await user.keyboard('{ArrowUp}');
    expect(day('Monday 5 October 2026')).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(day('Thursday 8 October 2026')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'October 2026' })).toBeInTheDocument();
  });

  it('marks the time field invalid and describes it when told to', () => {
    render(
      <>
        <Picker timeInvalid timeDescribedBy="why" />
        <p id="why">That time has passed.</p>
      </>,
    );
    expect(screen.getByLabelText('Time')).toBeInvalid();
    expect(screen.getByLabelText('Time')).toHaveAccessibleDescription('That time has passed.');
  });
});
