import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AccountPicker,
  CharacterCounter,
  IssueList,
  MediaThumb,
  NetworkIcon,
  networkName,
  PreviewFrame,
  StatusChip,
  TooltipProvider,
  type PickerAccount,
} from '../index';

describe('NetworkIcon', () => {
  it('is named for screen readers, or hidden when decorative', () => {
    render(
      <>
        <NetworkIcon network="instagram" variant="tile" />
        <NetworkIcon network="facebook_page" decorative />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Instagram' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Facebook' })).not.toBeInTheDocument();
  });

  it('has a mark for every network, LinkedIn included', () => {
    const { container } = render(<NetworkIcon network="linkedin_org" />);
    expect(container.textContent).toBe('in');
    expect(networkName('linkedin_person')).toBe('LinkedIn');
    expect(networkName('facebook_page')).toBe('Facebook');
  });
});

describe('StatusChip', () => {
  it('uses one wording per status, and takes a translation', () => {
    render(
      <>
        <StatusChip status="partial" />
        <StatusChip status="published" label="Publicado" />
      </>,
    );
    expect(screen.getByText('Partly published')).toHaveAttribute('data-status', 'partial');
    expect(screen.getByText('Publicado')).toBeInTheDocument();
  });
});

const accounts: PickerAccount[] = [
  { id: 'fb', name: 'Halden Coffee', network: 'facebook_page', status: 'active' },
  {
    id: 'ig',
    name: 'Halden Coffee',
    username: 'halden.coffee',
    network: 'instagram',
    status: 'active',
  },
  { id: 'old', name: 'Halden Kiosk', network: 'facebook_page', status: 'reauth_required' },
];

function Picker({ initial = [] as string[], onChange = vi.fn() }) {
  const [value, setValue] = useState(initial);
  return (
    <TooltipProvider>
      <AccountPicker
        accounts={accounts}
        value={value}
        onChange={(ids) => {
          onChange(ids);
          setValue(ids);
        }}
      />
    </TooltipProvider>
  );
}

describe('AccountPicker', () => {
  it('toggles accounts, telling same-named accounts apart by network', async () => {
    const onChange = vi.fn();
    render(<Picker onChange={onChange} />);
    const fb = screen.getByRole('button', { name: 'Halden Coffee, Facebook' });
    const ig = screen.getByRole('button', { name: 'Halden Coffee, Instagram' });
    await userEvent.click(fb);
    await userEvent.click(ig);
    expect(fb).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(['fb', 'ig']);
    await userEvent.click(fb);
    expect(fb).toHaveAttribute('aria-pressed', 'false');
    expect(onChange).toHaveBeenLastCalledWith(['ig']);
  });

  it('shows accounts that can’t post, with the reason, and doesn’t let them be chosen', async () => {
    render(<Picker />);
    const stale = screen.getByRole('button', {
      name: 'Halden Kiosk, Facebook: Reconnect this account to post to it',
    });
    expect(stale).toBeDisabled();
    await userEvent.click(stale);
    expect(stale).toHaveAttribute('aria-pressed', 'false');
  });

  it('an account already chosen that later needs reconnecting can still be removed', async () => {
    const onChange = vi.fn();
    render(<Picker initial={['old']} onChange={onChange} />);
    const stale = screen.getByRole('button', { name: /Halden Kiosk/ });
    expect(stale).toBeEnabled();
    await userEvent.click(stale);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('CharacterCounter', () => {
  it('is quiet with room, amber near the limit, red and "over" past it', () => {
    const { rerender } = render(<CharacterCounter count={100} max={2200} network="instagram" />);
    const counter = () => screen.getByLabelText(/characters/);
    expect(counter()).toHaveAttribute('data-state', 'ok');
    expect(counter()).toHaveAccessibleName('100 of 2,200 characters for Instagram');
    rerender(<CharacterCounter count={2000} max={2200} network="instagram" />);
    expect(counter()).toHaveAttribute('data-state', 'near');
    rerender(<CharacterCounter count={2212} max={2200} network="instagram" />);
    expect(counter()).toHaveAttribute('data-state', 'over');
    expect(counter()).toHaveAccessibleName('12 characters over the 2,200 limit for Instagram');
    expect(counter()).toHaveTextContent('−12');
  });
});

describe('IssueList', () => {
  it('lists errors before warnings, and jumps to what needs fixing', async () => {
    const onSelect = vi.fn();
    render(
      <IssueList
        issues={[
          { id: 'w', severity: 'warning', network: 'instagram', message: 'Links aren’t clickable' },
          { id: 'e', severity: 'error', network: 'instagram', message: 'Image too tall', onSelect },
        ]}
      />,
    );
    const list = screen.getByRole('region', { name: '1 problem to fix, 1 note' });
    const items = within(list).getAllByRole('listitem');
    expect(items.map((i) => i.textContent)).toEqual(['Image too tall', 'Links aren’t clickable']);
    await userEvent.click(within(list).getByRole('button', { name: /Image too tall/ }));
    expect(onSelect).toHaveBeenCalled();
  });

  it('says the post is ready when there is nothing to report (if asked to)', () => {
    const { container, rerender } = render(<IssueList issues={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<IssueList issues={[]} labels={{ ready: 'Ready to publish' }} />);
    expect(screen.getByText('Ready to publish')).toBeInTheDocument();
  });
});

describe('MediaThumb', () => {
  it('shows the picture with its alt text, video length, and a remove button', async () => {
    const onRemove = vi.fn();
    render(
      <MediaThumb
        src="https://cdn.test/a.jpg"
        alt="Latte art"
        kind="video"
        durationSec={75}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByRole('img', { name: 'Latte art' })).toBeInTheDocument();
    expect(screen.getByText('1:15')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove: Latte art' }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('says when a file is still processing', () => {
    render(<MediaThumb src={null} alt="tour.mp4" kind="video" status="processing" />);
    expect(screen.getByRole('status', { name: 'Processing' })).toBeInTheDocument();
  });
});

describe('PreviewFrame', () => {
  it('is a labelled figure with the account’s header', () => {
    render(
      <PreviewFrame
        network="instagram"
        account={{ name: 'Halden Coffee', username: 'halden.coffee' }}
      >
        Fresh roast today
      </PreviewFrame>,
    );
    const figure = screen.getByRole('figure', { name: 'Preview on Instagram' });
    expect(within(figure).getByText('halden.coffee')).toBeInTheDocument();
    expect(within(figure).getByText('Fresh roast today')).toBeInTheDocument();
  });
});
