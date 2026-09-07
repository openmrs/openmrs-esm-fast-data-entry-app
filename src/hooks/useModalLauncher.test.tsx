import { renderHook, act } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { describe, it, expect, vi } from 'vitest';
import useModalLauncher from './useModalLauncher';

describe('useModalLauncher', () => {
  it('preserves dismissal callbacks and disposes dialogs on replacement and owner unmount', () => {
    const firstDispose = vi.fn(),
      secondDispose = vi.fn(),
      onClose = vi.fn();
    vi.mocked(showModal).mockReturnValueOnce(firstDispose).mockReturnValueOnce(secondDispose);
    const { result, unmount } = renderHook(useModalLauncher);
    act(() => {
      result.current('first-modal', { patientUuid: 'patient-1' }, onClose);
    });
    expect(showModal).toHaveBeenLastCalledWith(
      'first-modal',
      expect.objectContaining({ patientUuid: 'patient-1' }),
      expect.any(Function),
    );
    act(() => {
      result.current('second-modal', {});
    });
    expect(firstDispose).toHaveBeenCalledOnce();
    const isOwnerMounted = vi.mocked(showModal).mock.calls.at(-1)[1].isOwnerMounted as () => boolean;
    expect(isOwnerMounted()).toBe(true);
    unmount();
    expect(isOwnerMounted()).toBe(false);
    expect(secondDispose).toHaveBeenCalledOnce();
  });
  it('invalidates pending callbacks when the workflow changes', () => {
    const close = vi.fn();
    vi.mocked(showModal).mockReturnValue(close);
    const { result, rerender } = renderHook(({ ownerKey }) => useModalLauncher(ownerKey), {
      initialProps: { ownerKey: 'first' },
    });
    act(() => {
      result.current('group-modal');
    });
    const isOwnerMounted = vi.mocked(showModal).mock.calls.at(-1)[1].isOwnerMounted as () => boolean;
    rerender({ ownerKey: 'second' });
    expect(isOwnerMounted()).toBe(false);
    expect(close).toHaveBeenCalledOnce();
  });

  it('does not dispose an already dismissed modal during owner cleanup', () => {
    const close = vi.fn(),
      onClose = vi.fn();
    vi.mocked(showModal).mockReturnValue(close);
    const { result, unmount } = renderHook(useModalLauncher);
    act(() => {
      result.current('group-modal', {}, onClose);
    });
    act(() => {
      vi.mocked(showModal).mock.calls.at(-1)[2]();
    });
    expect(onClose).toHaveBeenCalledOnce();
    unmount();
    expect(close).not.toHaveBeenCalled();
  });
  it('does not treat effect cleanup as user cancellation', () => {
    const onClose = vi.fn();
    vi.mocked(showModal).mockImplementation((name, props, dismissed) => () => dismissed());
    const { result } = renderHook(useModalLauncher);
    let dispose: () => void;
    act(() => {
      dispose = result.current('patient-modal', {}, onClose);
    });
    act(() => {
      dispose();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cancels a pending selection when the owning workflow changes', () => {
    const onClose = vi.fn();
    vi.mocked(showModal).mockImplementation((name, props, dismissed) => () => dismissed());
    const { result, rerender } = renderHook(({ key }) => useModalLauncher(key), { initialProps: { key: 'first' } });
    act(() => {
      result.current('patient-modal', {}, onClose);
    });
    rerender({ key: 'second' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
