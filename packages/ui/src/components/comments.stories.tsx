import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';

import { Pane } from '../stories/frame';
import {
  AvatarStack,
  CommentThread,
  MentionInput,
  type CommentPerson,
  type ThreadComment,
} from './comments';

export default { title: 'Comments' } satisfies StoryDefault;

const people: CommentPerson[] = [
  { id: 'u1', name: 'Priya Raman', avatarUrl: null },
  { id: 'u2', name: 'Marco Alves', avatarUrl: null },
  { id: 'u3', name: 'Ana de la Cruz', avatarUrl: null },
  { id: 'u4', name: 'Sam Okafor', avatarUrl: null },
  { id: 'u5', name: 'Lena Brandt', avatarUrl: null },
];

export const Stack: Story = () => (
  <Pane>
    <AvatarStack people={people.slice(0, 2)} label="Priya Raman and Marco Alves" />
    <AvatarStack people={people} label="Priya Raman, Marco Alves and 3 others" />
  </Pane>
);

export const Mentions: Story = () => {
  const [value, setValue] = useState('');
  const [mentions, setMentions] = useState<CommentPerson[]>([]);
  return (
    <Pane>
      <MentionInput
        value={value}
        mentions={mentions}
        onChange={(v, m) => {
          setValue(v);
          setMentions(m);
        }}
        people={people}
        listLabel="People"
        placeholder="Type @ to mention someone"
        aria-label="Comment"
      />
    </Pane>
  );
};

export const Thread: Story = () => {
  const [comments, setComments] = useState<ThreadComment[]>([
    {
      id: 'c1',
      parentId: null,
      author: people[1] ?? null,
      body: 'Can we use the autumn photo instead? @Priya Raman',
      mentions: [{ id: 'u1', name: 'Priya Raman' }],
      createdAt: '2026-10-12T09:00:00Z',
      editedAt: null,
      deletedAt: null,
    },
    {
      id: 'c2',
      parentId: 'c1',
      author: people[0] ?? null,
      body: 'Swapped it.',
      mentions: [],
      createdAt: '2026-10-12T09:05:00Z',
      editedAt: '2026-10-12T09:06:00Z',
      deletedAt: null,
    },
  ]);
  return (
    <Pane>
      <CommentThread
        comments={comments}
        currentUserId="u1"
        people={people}
        formatTime={() => '5 min ago'}
        onCreate={({ body, parentId }) => {
          setComments((c) => [
            ...c,
            {
              id: crypto.randomUUID(),
              parentId: parentId ?? null,
              author: people[0] ?? null,
              body,
              mentions: [],
              createdAt: new Date().toISOString(),
              editedAt: null,
              deletedAt: null,
            },
          ]);
          return Promise.resolve();
        }}
        onUpdate={(id, { body }) => {
          setComments((c) => c.map((x) => (x.id === id ? { ...x, body } : x)));
          return Promise.resolve();
        }}
        onDelete={(id) => {
          setComments((c) => c.filter((x) => x.id !== id));
          return Promise.resolve();
        }}
        labels={{
          empty: 'No comments yet.',
          placeholder: 'Write a comment… type @ to mention',
          replyPlaceholder: 'Reply…',
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
        }}
      />
    </Pane>
  );
};
