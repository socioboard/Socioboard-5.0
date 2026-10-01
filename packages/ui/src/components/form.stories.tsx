import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';

import { Pane } from '../stories/frame';
import { Checkbox, RadioCard, RadioGroup, Switch } from './choice';
import { Combobox } from './combobox';
import { DateTimePicker, type DateTimeValue } from './date-time-picker';
import { FormField, Input, Textarea } from './form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

export default { title: 'Inputs' } satisfies StoryDefault;

export const Fields: Story = () => (
  <Pane>
    <FormField label="Workspace name" hint="Your team sees this name." required>
      {(p) => <Input {...p} defaultValue="Halden Coffee" />}
    </FormField>
    <FormField label="Email" error="Enter a valid email address, like name@example.com.">
      {(p) => <Input {...p} type="email" defaultValue="priya@" />}
    </FormField>
    <FormField label="Caption">
      {(p) => (
        <Textarea {...p} defaultValue="Slow Saturday? Our autumn blend was roasted for this." />
      )}
    </FormField>
    <FormField label="Disabled">
      {(p) => <Input {...p} defaultValue="priya@halden.test" disabled />}
    </FormField>
  </Pane>
);

export const SelectAndCombobox: Story = () => {
  const [zone, setZone] = useState('Europe/Lisbon');
  const zones = [
    { value: 'America/New_York', label: 'New York', hint: 'GMT-4', keywords: 'Eastern Time USA' },
    { value: 'Europe/Lisbon', label: 'Lisbon', hint: 'GMT+1', keywords: 'Portugal' },
    { value: 'Asia/Kolkata', label: 'Kolkata', hint: 'GMT+5:30', keywords: 'India Calcutta' },
    { value: 'Asia/Tokyo', label: 'Tokyo', hint: 'GMT+9', keywords: 'Japan' },
  ];
  return (
    <Pane>
      <FormField label="Time zone (Combobox: search city, country or offset)">
        {(p) => (
          <Combobox
            {...p}
            options={zones}
            value={zone}
            onValueChange={setZone}
            searchLabel="Search time zones"
            emptyText="No matching time zone."
          />
        )}
      </FormField>
      <FormField label="Region (Select)">
        {(p) => (
          <Select defaultValue="Europe/Lisbon">
            <SelectTrigger {...p}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Europe</SelectLabel>
                <SelectItem value="Europe/Lisbon">Lisbon</SelectItem>
                <SelectItem value="Europe/Berlin">Berlin</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Asia</SelectLabel>
                <SelectItem value="Asia/Kolkata">Kolkata</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </FormField>
    </Pane>
  );
};

export const Choices: Story = () => (
  <Pane>
    <Checkbox
      label="Sign out of other devices"
      description="Recommended if you think someone else knows your password."
      defaultChecked
    />
    <label className="flex items-center gap-3 text-sm">
      <Switch defaultChecked aria-label="Two-factor authentication" />
      Two-factor authentication
    </label>
    <RadioGroup defaultValue="editor" aria-label="Role">
      <RadioCard
        value="admin"
        label="Admin"
        description="Manages members, settings and connected accounts."
      />
      <RadioCard
        value="editor"
        label="Editor"
        description="Creates, publishes and approves posts."
      />
      <RadioCard
        value="viewer"
        label="Viewer"
        description="Sees the calendar, posts and analytics; changes nothing."
      />
    </RadioGroup>
  </Pane>
);

export const DateAndTime: Story = () => {
  // A wall-clock day and time in the workspace's timezone; the screen turns it into an instant.
  const [value, setValue] = useState<DateTimeValue>({ date: '2026-10-06', time: '09:00' });
  return (
    <Pane>
      <DateTimePicker
        value={value}
        onChange={setValue}
        timeZone="Europe/Lisbon"
        minDate="2026-10-01"
        maxDate="2027-10-01"
        locale="en-GB"
      />
      <p className="text-ink-2 text-sm">
        {value.date} at {value.time}, Lisbon time. Days before 1 October 2026 are off.
      </p>
    </Pane>
  );
};
