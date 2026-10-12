import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AvatarStack,
  CommentThread,
  MentionInput,
  mentionsIn,
  type CommentPerson,
  type CommentThreadProps,
  type ThreadComment,
} from '../components/comments';

const people: CommentPerson[] = [
  { id: 'u1', name: 'Priya Raman', avatarUrl: null },
  { id: 'u2', name: 'Marco Alves', avatarUrl: null },
  { id: 'u3', name: 'Mara Lind', avatarUrl: null },
];

function Box({ onSubmit }: { onSubmit?: (text: string, ids: string[]) => void }) {
  const [value, setValue] = useState('');
  const [mentions, setMentions] = useState<CommentPerson[]>([]);
  return (
    <MentionInput
      aria-label="Comment"
      value={value}
      mentions={mentions}
      onChange={(v, m) => {
        setValue(v);
        setMentions(m);
      }}
      people={people}
      listLabel="People"
      onSubmit={() =>
        onSubmit?.(
          value,
          mentionsIn(value, mentions).map((m) => m.id),
        )
      }
    />
  );
}

/** The element, or a clear failure. */
function one<T>(found: T | undefined): T {
  if (found === undefined) throw new Error('Not found');
  return found;
}

const labels: CommentThreadProps['labels'] = {
  empty: 'No comments yet.',
  placeholder: 'Write a comment',
  replyPlaceholder: 'Write a reply',
  send: 'Comment',
  reply: 'Reply',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  edited: 'edited',
  deleted: 'Comment deleted',
  unknownAuthor: 'Former member',
  actions: 'Comment actions',
  confirmDelete: 'Delete this comment?',
  people: 'People',
  sendHint: 'Ctrl+Enter to send',
};

const comment = (over: Partial<ThreadComment>): ThreadComment => ({
  id: 'c1',
  parentId: null,
  author: people[1] ?? null,
  body: 'Hello',
  mentions: [],
  createdAt: '2026-10-12T09:00:00Z',
  editedAt: null,
  deletedAt: null,
  ...over,
});

function thread(comments: ThreadComment[], over: Partial<CommentThreadProps> = {}) {
  const props: CommentThreadProps = {
    comments,
    currentUserId: 'u1',
    people,
    onCreate: vi.fn(() => Promise.resolve()),
    onUpdate: vi.fn(() => Promise.resolve()),
    onDelete: vi.fn(() => Promise.resolve()),
    formatTime: () => 'just now',
    labels,
    ...over,
  };
  render(<CommentThread {...props} />);
  return props;
}

describe('AvatarStack', () => {
  it('shows a few avatars, then +N, named as a whole', () => {
    render(<AvatarStack people={people} max={2} label="Priya, Marco and 1 other" />);
    expect(screen.getByRole('img', { name: 'Priya, Marco and 1 other' })).toHaveTextContent('+1');
  });
});

describe('MentionInput', () => {
  it('"@" lists matching people; Enter picks one as @Name, and it is mentioned', async () => {
    const onSubmit = vi.fn();
    render(<Box onSubmit={onSubmit} />);
    const box = screen.getByRole('combobox', { name: 'Comment' });
    await userEvent.type(box, 'Hi @ma');
    const list = screen.getByRole('listbox', { name: 'People' });
    expect(
      within(list)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['MAMarco Alves', 'MLMara Lind']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(box).toHaveValue('Hi @Mara Lind ');
    expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenCalledWith('Hi @Mara Lind ', ['u3']);
  });

  it('a mention removed from the text is no longer mentioned; Escape closes the list', async () => {
    const onSubmit = vi.fn();
    render(<Box onSubmit={onSubmit} />);
    const box = screen.getByRole('combobox', { name: 'Comment' });
    await userEvent.type(box, '@pri{Enter}');
    expect(box).toHaveValue('@Priya Raman ');
    await userEvent.clear(box);
    await userEvent.type(box, 'thanks @');
    expect(screen.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible();
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenCalledWith('thanks @', []);
  });
});

describe('CommentThread', () => {
  it('replies sit under their comment; mentions are marked; deleted ones say so', () => {
    thread([
      comment({ id: 'c1', deletedAt: '2026-10-12T09:01:00Z', body: '', author: null }),
      comment({
        id: 'c2',
        parentId: 'c1',
        body: 'Ping @Priya Raman',
        mentions: [{ id: 'u1', name: 'Priya Raman' }],
        editedAt: '2026-10-12T09:02:00Z',
      }),
    ]);
    expect(screen.getByText('Comment deleted')).toBeInTheDocument();
    expect(screen.getByText('@Priya Raman')).toHaveClass('font-medium');
    expect(screen.getByText(/edited/)).toBeInTheDocument();
  });

  it('writes a comment, and a reply to a comment', async () => {
    const props = thread([comment({})]);
    await userEvent.type(screen.getByRole('combobox', { name: 'Write a comment' }), 'Looks good');
    await userEvent.click(screen.getByRole('button', { name: 'Comment' }));
    expect(props.onCreate).toHaveBeenCalledWith({ body: 'Looks good', mentionIds: [] });
    expect(screen.getByRole('combobox', { name: 'Write a comment' })).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'Reply' }));
    await userEvent.type(screen.getByRole('combobox', { name: 'Write a reply' }), 'Thanks');
    await userEvent.click(one(screen.getAllByRole('button', { name: 'Reply' }).at(-1)));
    expect(props.onCreate).toHaveBeenLastCalledWith({
      body: 'Thanks',
      mentionIds: [],
      parentId: 'c1',
    });
  });

  it('only your own comments have actions; delete asks first', async () => {
    const props = thread([
      comment({ id: 'c1', author: people[1] ?? null }),
      comment({ id: 'c2', author: people[0] ?? null, body: 'Mine' }),
    ]);
    const actions = screen.getAllByRole('button', { name: 'Comment actions' });
    expect(actions).toHaveLength(1);
    await userEvent.click(one(actions[0]));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(screen.getByText('Delete this comment?')).toBeInTheDocument();
    expect(props.onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(props.onDelete).toHaveBeenCalledWith('c2');
  });

  it('edits your comment in place', async () => {
    const props = thread([comment({ id: 'c2', author: people[0] ?? null, body: 'Mine' })]);
    await userEvent.click(screen.getByRole('button', { name: 'Comment actions' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    const box = one(screen.getAllByRole('combobox', { name: 'Write a comment' })[0]);
    expect(box).toHaveValue('Mine');
    await userEvent.type(box, '!');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onUpdate).toHaveBeenCalledWith('c2', { body: 'Mine!', mentionIds: [] });
  });
});
