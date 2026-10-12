import { CornerDownRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../cn';
import { AnimatePresence, listItem, motion } from '../motion';
import { searchWords } from '../search';
import { Button } from './button';
import { Avatar } from './display';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Textarea } from './form';

/** Someone shown in a stack, a comment, or the @mention list. */
export interface CommentPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// ── AvatarStack ─────────────────────────────────────────────────────────────────────────────────

export interface AvatarStackProps {
  people: readonly Pick<CommentPerson, 'id' | 'name' | 'avatarUrl'>[];
  /** How many avatars before "+N". */
  max?: number;
  /** Read out for the whole stack, e.g. "Commented by Priya, Marco and 2 others". */
  label: string;
  className?: string;
}

/** Overlapping avatars of the people involved (reviewers, commenters), then "+N". */
export function AvatarStack({ people, max = 3, label, className }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const more = people.length - shown.length;
  return (
    <span role="img" aria-label={label} className={cn('inline-flex items-center', className)}>
      {shown.map((p, i) => (
        <Avatar
          key={p.id}
          name={p.name}
          src={p.avatarUrl}
          size="xs"
          decorative
          className={cn('ring-canvas ring-2', i > 0 && '-ml-1.5')}
        />
      ))}
      {more > 0 && (
        <span
          aria-hidden="true"
          className="bg-chip text-ink-2 ring-canvas -ml-1.5 inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ring-2"
        >
          +{more}
        </span>
      )}
    </span>
  );
}

// ── MentionInput ────────────────────────────────────────────────────────────────────────────────

/** The people still @mentioned in `text`: those picked whose "@Name" is still there. */
export function mentionsIn<T extends { name: string }>(text: string, picked: readonly T[]): T[] {
  return picked.filter((p) => text.includes(`@${p.name}`));
}

/** Every typed word starts one of the name's words: "ma" finds Marco Alves, not Priya Raman. */
function startsWords(name: string, words: readonly string[]): boolean {
  const parts = searchWords(name);
  return words.every((w) => parts.some((p) => p.startsWith(w)));
}

/** What is being typed after an "@" right before the caret (at most 30 characters, one line). */
function mentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const at = before.lastIndexOf('@');
  if (at < 0) return null;
  if (at > 0 && !/\s/.test(before[at - 1] ?? '')) return null;
  const query = before.slice(at + 1);
  if (query.length > 30 || /[\n@]/.test(query)) return null;
  return { start: at, query };
}

export interface MentionInputProps extends Omit<
  ComponentProps<'textarea'>,
  'value' | 'onChange' | 'onSubmit'
> {
  value: string;
  /** Who was picked from the list so far (keep them; `mentionsIn` says who is still in the text). */
  mentions: readonly CommentPerson[];
  onChange: (value: string, mentions: CommentPerson[]) => void;
  /** Who can be mentioned. */
  people: readonly CommentPerson[];
  /** Ctrl/⌘+Enter. */
  onSubmit?: () => void;
  /** Accessible name of the list of people. */
  listLabel: string;
}

/**
 * A text box where "@" opens a list of people to mention (above the box: comment boxes sit at
 * the end of a thread, near the bottom of the screen): typing filters it, arrow keys move,
 * Enter or Tab picks (the name goes in as "@Name"), Escape closes. Ctrl/⌘+Enter submits.
 */
export function MentionInput({
  value,
  mentions,
  onChange,
  people,
  onSubmit,
  listLabel,
  className,
  onKeyDown,
  ...props
}: MentionInputProps) {
  const listId = useId();
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [caret, setCaret] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState<number | null>(null);
  // Where the caret goes once a picked name is in the text: set in the same commit, before the
  // next key lands (a frame later, fast typing would end up before the caret's new place).
  const pendingCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingCaret.current === null) return;
    ref.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
    pendingCaret.current = null;
  }, [value]);

  const typing = caret === null ? null : mentionQuery(value, caret);
  const options = useMemo(() => {
    if (!typing) return [];
    const words = searchWords(typing.query);
    return people.filter((p) => startsWords(p.name, words)).slice(0, 6);
  }, [people, typing]);
  const open = typing !== null && dismissed !== typing.start && options.length > 0;
  const optionId = (i: number) => `${listId}-${String(i)}`;
  const current = Math.min(active, options.length - 1);

  const pick = (person: CommentPerson | undefined) => {
    if (!person || !typing || caret === null) return;
    const inserted = `@${person.name} `;
    const next = value.slice(0, typing.start) + inserted + value.slice(caret);
    const at = typing.start + inserted.length;
    onChange(next, [...mentions.filter((m) => m.id !== person.id), person]);
    pendingCaret.current = at;
    setCaret(at);
    setActive(0);
    // That "@" is done: the name after it isn't a new search.
    setDismissed(typing.start);
  };

  const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setActive((current + step + options.length) % options.length);
        return;
      }
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
        e.preventDefault();
        pick(options[current]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setDismissed(typing.start);
        return;
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const follow = (el: HTMLTextAreaElement) => {
    setCaret(el.selectionStart === el.selectionEnd ? el.selectionStart : null);
  };

  return (
    <div className="relative">
      <Textarea
        {...props}
        ref={ref}
        role="combobox"
        aria-multiline="true"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        {...(open ? { 'aria-activedescendant': optionId(current) } : {})}
        value={value}
        onChange={(e) => {
          onChange(e.target.value, [...mentions]);
          follow(e.target);
          setActive(0);
        }}
        onSelect={(e) => {
          follow(e.currentTarget);
        }}
        onBlur={() => {
          setCaret(null);
        }}
        onKeyDown={keyDown}
        className={cn('min-h-20', className)}
      />
      <div
        id={listId}
        role="listbox"
        aria-label={listLabel}
        hidden={!open}
        className="glass-float animate-pop-in absolute bottom-full left-0 z-50 mb-1.5 w-64 max-w-full rounded-[14px] p-1"
      >
        {open &&
          options.map((person, i) => (
            <div
              key={person.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === current}
              data-active={i === current ? '' : undefined}
              // Keep focus (and the caret) in the text box; the click still picks.
              onPointerDown={(e) => {
                e.preventDefault();
              }}
              onPointerMove={() => {
                if (i !== current) setActive(i);
              }}
              onClick={() => {
                pick(person);
              }}
              className="text-ink data-[active]:bg-chip flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm select-none"
            >
              <Avatar name={person.name} src={person.avatarUrl} size="xs" decorative />
              <span className="truncate">{person.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ── CommentThread ───────────────────────────────────────────────────────────────────────────────

export interface ThreadComment {
  id: string;
  /** Replies are one level deep: a reply's parent is a top-level comment. */
  parentId: string | null;
  author: CommentPerson | null;
  body: string;
  mentions: readonly { id: string; name: string }[];
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface CommentThreadLabels {
  empty: string;
  placeholder: string;
  replyPlaceholder: string;
  send: string;
  reply: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  /** Next to the time of an edited comment. */
  edited: string;
  /** In place of a deleted comment that has replies. */
  deleted: string;
  /** Shown for a comment whose author's account is gone. */
  unknownAuthor: string;
  /** The menu of a comment's actions. */
  actions: string;
  /** Asks before deleting. */
  confirmDelete: string;
  /** The @mention list. */
  people: string;
  /** Hint under the box: "Ctrl+Enter to send". */
  sendHint: string;
}

export interface CommentThreadProps {
  comments: readonly ThreadComment[];
  /** Whose comments can be edited and deleted here. */
  currentUserId: string;
  /** Who can be @mentioned. */
  people: readonly CommentPerson[];
  /** Each returns once saved; a rejection keeps what was typed. */
  onCreate: (input: { body: string; mentionIds: string[]; parentId?: string }) => Promise<unknown>;
  onUpdate: (id: string, input: { body: string; mentionIds: string[] }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  /** "5 min ago", in the reader's language. */
  formatTime: (iso: string) => string;
  labels: CommentThreadLabels;
  /** A comment to bring into view and mark (from a notification's link). */
  highlightId?: string | undefined;
  className?: string;
}

/** A comment's text with its @mentions marked. */
function Body({ text, mentions }: { text: string; mentions: ThreadComment['mentions'] }) {
  const names = [...new Set(mentions.map((m) => m.name))].sort((a, b) => b.length - a.length);
  if (names.length === 0) return <>{text}</>;
  const pattern = new RegExp(
    `(@(?:${names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}))`,
    'g',
  );
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-ring font-medium">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** The box to write a comment, a reply, or an edit, with @mentions. */
function Composer({
  initial,
  people,
  placeholder,
  submitLabel,
  labels,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  initial?: { body: string; mentions: readonly CommentPerson[] };
  people: readonly CommentPerson[];
  placeholder: string;
  submitLabel: string;
  labels: CommentThreadLabels;
  onSubmit: (body: string, mentionIds: string[]) => Promise<unknown>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [body, setBody] = useState(initial?.body ?? '');
  const [mentions, setMentions] = useState<CommentPerson[]>([...(initial?.mentions ?? [])]);
  const [busy, setBusy] = useState(false);
  const hintId = useId();
  const empty = body.trim() === '';

  const submit = async () => {
    if (empty || busy) return;
    setBusy(true);
    try {
      await onSubmit(
        body.trim(),
        mentionsIn(body, mentions).map((m) => m.id),
      );
      if (!initial) {
        setBody('');
        setMentions([]);
      }
    } catch {
      // The caller shows the error; what was typed stays.
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <MentionInput
        value={body}
        mentions={mentions}
        onChange={(next, picked) => {
          setBody(next);
          setMentions(picked);
        }}
        people={people}
        onSubmit={() => void submit()}
        listLabel={labels.people}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-describedby={hintId}
        maxLength={5000}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && onCancel) {
            e.preventDefault();
            onCancel();
          }
        }}
      />
      <div className="flex items-center justify-end gap-2">
        <span id={hintId} className="text-ink-3 mr-auto text-xs">
          {labels.sendHint}
        </span>
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            {labels.cancel}
          </Button>
        )}
        <Button
          size="sm"
          variant="primary"
          onClick={() => void submit()}
          disabled={empty}
          loading={busy}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  mine,
  reply,
  props,
  editing,
  onEdit,
  onReply,
}: {
  comment: ThreadComment;
  mine: boolean;
  reply: boolean;
  props: CommentThreadProps;
  editing: boolean;
  onEdit: (on: boolean) => void;
  onReply: () => void;
}) {
  const { labels, people, formatTime } = props;
  const [confirming, setConfirming] = useState(false);
  const deleted = comment.deletedAt !== null;
  const name = comment.author?.name ?? labels.unknownAuthor;
  const highlighted = props.highlightId === comment.id;

  let content: ReactNode;
  if (deleted) {
    content = <p className="text-ink-3 text-sm italic">{labels.deleted}</p>;
  } else if (editing) {
    content = (
      <Composer
        initial={{
          body: comment.body,
          mentions: comment.mentions.map(
            (m) => people.find((p) => p.id === m.id) ?? { ...m, avatarUrl: null },
          ),
        }}
        people={people}
        placeholder={labels.placeholder}
        submitLabel={labels.save}
        labels={labels}
        autoFocus
        onSubmit={async (body, mentionIds) => {
          await props.onUpdate(comment.id, { body, mentionIds });
          onEdit(false);
        }}
        onCancel={() => {
          onEdit(false);
        }}
      />
    );
  } else {
    content = (
      <p className="text-ink text-sm leading-relaxed break-words whitespace-pre-wrap">
        <Body text={comment.body} mentions={comment.mentions} />
      </p>
    );
  }

  return (
    <div
      id={`comment-${comment.id}`}
      data-highlighted={highlighted ? '' : undefined}
      className={cn(
        'group flex scroll-mt-24 gap-2.5 rounded-xl p-2 transition-colors duration-500',
        'data-[highlighted]:bg-chip',
        reply && 'ml-9',
      )}
    >
      {deleted ? (
        <span className="bg-chip size-7 shrink-0 rounded-full" aria-hidden="true" />
      ) : (
        <Avatar name={name} src={comment.author?.avatarUrl ?? null} size="sm" decorative />
      )}
      <div className="min-w-0 flex-1">
        {!deleted && (
          <div className="flex items-baseline gap-2">
            <span className="text-ink truncate text-sm font-semibold">{name}</span>
            <time dateTime={comment.createdAt} className="text-ink-3 shrink-0 text-xs">
              {formatTime(comment.createdAt)}
              {comment.editedAt && ` · ${labels.edited}`}
            </time>
            {mine && !editing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={labels.actions}
                    className="ml-auto size-7 opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => {
                      onEdit(true);
                    }}
                  >
                    <Pencil aria-hidden="true" />
                    {labels.edit}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    tone="danger"
                    onSelect={() => {
                      setConfirming(true);
                    }}
                  >
                    <Trash2 aria-hidden="true" />
                    {labels.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
        {content}
        {confirming && (
          <div role="group" className="mt-2 flex items-center gap-2">
            <span className="text-ink-2 mr-auto text-xs">{labels.confirmDelete}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setConfirming(false);
              }}
            >
              {labels.cancel}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                void props.onDelete(comment.id).finally(() => {
                  setConfirming(false);
                });
              }}
            >
              {labels.delete}
            </Button>
          </div>
        )}
        {!reply && !editing && !confirming && (
          <button
            type="button"
            onClick={onReply}
            className="text-ink-3 hover:text-ink mt-1 inline-flex cursor-pointer items-center gap-1 text-xs font-medium"
          >
            <CornerDownRight className="size-3" aria-hidden="true" />
            {labels.reply}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A post's comments, oldest first, replies under their comment (one level deep), with the box to
 * write a new one. Your own comments have Edit and Delete; "@" mentions someone who can see the
 * post. The thread only shows and asks: saving is the caller's (`onCreate`, `onUpdate`,
 * `onDelete`), and new comments arrive through `comments`.
 */
export function CommentThread(props: CommentThreadProps) {
  const { comments, currentUserId, people, labels, className } = props;
  const [editing, setEditing] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const top = comments.filter((c) => c.parentId === null);
  const replies = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {top.length === 0 ? (
        <p className="text-ink-3 py-2 text-sm">{labels.empty}</p>
      ) : (
        <ol className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {top.map((c, i) => (
              <motion.li key={c.id} {...listItem(i)} className="flex flex-col gap-1">
                <CommentItem
                  comment={c}
                  mine={c.author?.id === currentUserId}
                  reply={false}
                  props={props}
                  editing={editing === c.id}
                  onEdit={(on) => {
                    setEditing(on ? c.id : null);
                  }}
                  onReply={() => {
                    setReplyTo(c.id);
                  }}
                />
                {replies(c.id).length > 0 && (
                  <ol className="flex flex-col gap-1">
                    <AnimatePresence initial={false}>
                      {replies(c.id).map((r, j) => (
                        <motion.li key={r.id} {...listItem(j)}>
                          <CommentItem
                            comment={r}
                            mine={r.author?.id === currentUserId}
                            reply
                            props={props}
                            editing={editing === r.id}
                            onEdit={(on) => {
                              setEditing(on ? r.id : null);
                            }}
                            onReply={() => {
                              setReplyTo(c.id);
                            }}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ol>
                )}
                {replyTo === c.id && (
                  <div className="ml-9 p-2">
                    <Composer
                      people={people}
                      placeholder={labels.replyPlaceholder}
                      submitLabel={labels.reply}
                      labels={labels}
                      autoFocus
                      onSubmit={async (body, mentionIds) => {
                        await props.onCreate({ body, mentionIds, parentId: c.id });
                        setReplyTo(null);
                      }}
                      onCancel={() => {
                        setReplyTo(null);
                      }}
                    />
                  </div>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
      <Composer
        people={people}
        placeholder={labels.placeholder}
        submitLabel={labels.send}
        labels={labels}
        onSubmit={(body, mentionIds) => props.onCreate({ body, mentionIds })}
      />
    </div>
  );
}
