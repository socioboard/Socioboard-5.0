// Motion for things CSS can't do alone (docs/frontend/design-system.md, "Motion"): leaving the
// screen, moving to a new place in a list, growing to a height that isn't known ahead, and one
// highlight gliding between items. Simple arrivals and hovers stay in CSS (styles.css).
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  MotionGlobalConfig,
  useAnimate,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from 'motion/react';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export { AnimatePresence, LayoutGroup, motion };

/** Leaving: quick, speeding up as it goes (matches --ease-exit in styles.css). */
const EXIT_EASE = [0.4, 0, 1, 1] as const;

/**
 * The app's springs, in Apple's terms (bounce ≈ 1 − damping ratio; visualDuration ≈ response):
 * critically damped by default, so nothing overshoots: `snappy` for controls and highlights,
 * `gentle` for panels and lists. `momentum` bounces a little, and only for things the person
 * flicked, threw or released from a drag.
 */
export const springs = {
  snappy: { type: 'spring', bounce: 0, visualDuration: 0.3 },
  gentle: { type: 'spring', bounce: 0, visualDuration: 0.4 },
  momentum: { type: 'spring', bounce: 0.2, visualDuration: 0.35 },
} satisfies Record<string, Transition>;

/**
 * For tests: Motion's animations finish at once (things that leave are removed straight away),
 * so assertions see the end state, as CSS animations don't hold anything up either.
 */
export function skipMotionInTests() {
  MotionGlobalConfig.skipAnimations = true;
}

/**
 * A motion.div that, once it's leaving (its exit animation is playing), can't be used or read any
 * more: it's inert and hidden from assistive tech, so only the content that replaced it counts.
 */
export function Leaving(props: HTMLMotionProps<'div'>) {
  const present = useIsPresent();
  return <motion.div {...props} {...(present ? {} : { inert: true, 'aria-hidden': true })} />;
}

/** Wrap the app once: everything follows the system's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={springs.snappy}>
      {children}
    </MotionConfig>
  );
}

/**
 * Opens and closes to its content's height (disclosures, history, panels that appear). Closed
 * content isn't rendered.
 */
export function Collapse({
  open,
  children,
  className,
  id,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <Leaving
          id={id}
          key="collapse"
          className={className}
          style={{ overflow: 'hidden' }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1, transition: springs.gentle }}
          exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: EXIT_EASE } }}
        >
          {children}
        </Leaving>
      )}
    </AnimatePresence>
  );
}

/**
 * Swaps its content when `id` changes: the old one lifts away as the new one rises in (a status,
 * "Saving…" → "Saved", a step of a flow). `direction` 1/-1 slides sideways instead, for steps.
 */
export function Swap({
  id,
  children,
  className,
  direction = 0,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  direction?: -1 | 0 | 1;
}) {
  const x = direction * 24;
  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <Leaving
        key={id}
        className={className}
        initial={{ opacity: 0, y: direction === 0 ? 6 : 0, x, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: springs.gentle }}
        exit={{
          opacity: 0,
          y: direction === 0 ? -6 : 0,
          x: -x,
          filter: 'blur(3px)',
          transition: { duration: 0.14, ease: EXIT_EASE },
        }}
      >
        {children}
      </Leaving>
    </AnimatePresence>
  );
}

/**
 * Content that changes in place (a tab switched, another account picked) refreshes with a quick
 * rise instead of snapping, without remounting it (focus and typing survive). Put the returned
 * ref on the element; `key` is what changes. Under reduced motion it crossfades instead.
 */
export function useChangeMotion<T extends Element = HTMLDivElement>(key: unknown) {
  const [scope, animate] = useAnimate<T>();
  const reduced = useReducedMotion();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Reduced motion: a short crossfade still shows that something changed.
    void (reduced
      ? animate(scope.current, { opacity: [0.5, 1] }, { duration: 0.15 })
      : animate(
          scope.current,
          { opacity: [0.4, 1], y: [6, 0], filter: ['blur(2px)', 'blur(0px)'] },
          springs.gentle,
        ));
    // Only a change of `key` replays it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return scope;
}

/** Staggers a CSS entrance (`animate-enter`): the item's place among its siblings. */
export const staggerStyle = (index: number) => ({ '--i': index }) as CSSProperties;

/** A list item that animates in, out, and to its new place when the list changes. */
export const listItemMotion = {
  layout: 'position' as const,
  initial: { opacity: 0, scale: 0.92, filter: 'blur(3px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: springs.gentle },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.14, ease: EXIT_EASE } },
  transition: springs.gentle,
};

/**
 * `listItemMotion` for the item at `index`: items shown together arrive one after another, 35 ms
 * apart and at most 12 steps (spread these props on a `motion` element inside AnimatePresence).
 */
export function listItem(index: number) {
  return {
    ...listItemMotion,
    animate: {
      ...listItemMotion.animate,
      transition: { ...springs.gentle, delay: Math.min(index, 12) * 0.035 },
    },
  };
}
