import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Drawer, DrawerContent, DrawerTitle } from '../components/drawer';
import { createVelocityTracker, project, rubberband } from '../gestures';

describe('gesture maths (Designing Fluid Interfaces)', () => {
  it('projects a flick like scrolling decelerates', () => {
    expect(project(0)).toBe(0);
    // 1000 px/s at 0.998 carries ~499 px.
    expect(project(1000)).toBeCloseTo(499, 0);
    expect(project(-1000)).toBeCloseTo(-499, 0);
    expect(project(1000, 0.99)).toBeCloseTo(99, 0);
  });

  it('resists more the further past the edge', () => {
    const near = rubberband(20, 400);
    const far = rubberband(400, 400);
    expect(near).toBeLessThan(20);
    expect(near).toBeGreaterThan(0);
    // Pulled 20× further, it moves far less than 20× as much.
    expect(far).toBeLessThan(near * 20);
    expect(rubberband(50, 0)).toBe(0);
  });

  it('measures velocity over the last moments of a drag', () => {
    const t = createVelocityTracker(100);
    t.add(0, 0);
    t.add(10, 10);
    t.add(60, 60);
    expect(t.velocity()).toBeCloseTo(1000, 0);
    t.add(60, 300); // an old sample drops out of the window
    expect(t.velocity()).toBe(0);
  });
});

/**
 * A pointer event at `clientY` and `time` (ms; fireEvent can't set timeStamp, and React reads a
 * timeStamp of 0 as "now", so tests start at 1000).
 */
function pointer(el: HTMLElement, type: string, clientY: number, time: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientY });
  Object.defineProperty(event, 'timeStamp', { value: time });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  act(() => {
    el.dispatchEvent(event);
  });
}

describe('bottom sheet drag to dismiss', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderSheet(onOpenChange: (open: boolean) => void) {
    // A phone-sized screen: the drawer is a bottom sheet.
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({ matches: query.includes('max-width'), media: query }) as unknown as MediaQueryList,
    );
    render(
      <Drawer open onOpenChange={onOpenChange}>
        <DrawerContent closeLabel="Close">
          <DrawerTitle>Account details</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    const handle = document.querySelector<HTMLElement>('[data-drawer-handle]');
    const sheet = screen.getByRole('dialog');
    if (!handle) throw new Error('no handle');
    Object.defineProperty(sheet, 'offsetHeight', { value: 400 });
    handle.setPointerCapture = () => undefined;
    return { handle, sheet };
  }

  it('follows the finger down, and a flick down closes it', () => {
    const onOpenChange = vi.fn();
    const { handle, sheet } = renderSheet(onOpenChange);
    pointer(handle, 'pointerdown', 100, 1000);
    pointer(handle, 'pointermove', 160, 1016);
    expect(sheet.style.transform).toBe('translateY(60px)');
    pointer(handle, 'pointermove', 260, 1050);
    pointer(handle, 'pointerup', 260, 1050);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dragged a little, held, then let go: it stays open (the pause leaves no speed)', () => {
    const onOpenChange = vi.fn();
    const { handle } = renderSheet(onOpenChange);
    pointer(handle, 'pointerdown', 100, 1000);
    pointer(handle, 'pointermove', 120, 1016);
    pointer(handle, 'pointermove', 140, 1032);
    // Held still for 300 ms before letting go.
    pointer(handle, 'pointerup', 140, 1332);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('after letting go, a mouse just passing over the handle doesn’t move the sheet', () => {
    const onOpenChange = vi.fn();
    const { handle, sheet } = renderSheet(onOpenChange);
    pointer(handle, 'pointerdown', 100, 1000);
    pointer(handle, 'pointermove', 140, 1016);
    pointer(handle, 'pointerup', 140, 1400);
    const after = sheet.style.transform;
    // Hovering: moves with no press.
    pointer(handle, 'pointermove', 400, 1500);
    pointer(handle, 'pointermove', 420, 1516);
    expect(sheet.style.transform).toBe(after);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('pulled up, it resists and doesn’t close', () => {
    const onOpenChange = vi.fn();
    const { handle, sheet } = renderSheet(onOpenChange);
    pointer(handle, 'pointerdown', 300, 1000);
    pointer(handle, 'pointermove', 200, 1100);
    const y = Number(/translateY\((-?[\d.]+)px\)/.exec(sheet.style.transform)?.[1]);
    // 100 px of pull moves it less than 100 px up.
    expect(y).toBeLessThan(0);
    expect(y).toBeGreaterThan(-100);
    pointer(handle, 'pointerup', 200, 1100);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
