"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface Win98WindowManagerContextValue {
  hiddenWindowIds: ReadonlySet<string>;
  hideWindow: (windowId: string) => void;
  registerWindow: (windowId: string) => void;
  restoreAllWindows: () => void;
  unregisterWindow: (windowId: string) => void;
}

const Win98WindowManagerContext = createContext<Win98WindowManagerContextValue | undefined>(undefined);

const noopWindowAction = (windowId: string): void => {
  void windowId;
};

const FALLBACK_CONTEXT_VALUE: Win98WindowManagerContextValue = {
  hiddenWindowIds: new Set<string>(),
  hideWindow: noopWindowAction,
  registerWindow: noopWindowAction,
  restoreAllWindows: () => undefined,
  unregisterWindow: noopWindowAction,
};

interface Win98WindowManagerProps {
  children: ReactNode;
}

export function Win98WindowManager({ children }: Readonly<Win98WindowManagerProps>) {
  const [registeredWindowIds, setRegisteredWindowIds] = useState<Set<string>>(() => new Set());
  const [hiddenWindowIds, setHiddenWindowIds] = useState<Set<string>>(() => new Set());

  const registerWindow = useCallback((windowId: string): void => {
    setRegisteredWindowIds((currentWindowIds) => {
      const nextWindowIds = new Set(currentWindowIds);
      nextWindowIds.add(windowId);
      return nextWindowIds;
    });
  }, []);

  const unregisterWindow = useCallback((windowId: string): void => {
    setRegisteredWindowIds((currentWindowIds) => {
      const nextWindowIds = new Set(currentWindowIds);
      nextWindowIds.delete(windowId);
      return nextWindowIds;
    });
    setHiddenWindowIds((currentWindowIds) => {
      const nextWindowIds = new Set(currentWindowIds);
      nextWindowIds.delete(windowId);
      return nextWindowIds;
    });
  }, []);

  const hideWindow = useCallback((windowId: string): void => {
    setHiddenWindowIds((currentWindowIds) => {
      const nextWindowIds = new Set(currentWindowIds);
      nextWindowIds.add(windowId);
      return nextWindowIds;
    });
  }, []);

  const restoreAllWindows = useCallback((): void => {
    setHiddenWindowIds(new Set());
  }, []);

  const allWindowsHidden =
    registeredWindowIds.size > 0 &&
    [...registeredWindowIds].every((windowId) => hiddenWindowIds.has(windowId));

  const contextValue = useMemo(
    () => ({
      hiddenWindowIds,
      hideWindow,
      registerWindow,
      restoreAllWindows,
      unregisterWindow,
    }),
    [hiddenWindowIds, hideWindow, registerWindow, restoreAllWindows, unregisterWindow]
  );

  return (
    <Win98WindowManagerContext.Provider value={contextValue}>
      {children}
      {allWindowsHidden && (
        <div className="all-windows-closed">
          <div className="window all-windows-closed-card">
            <div className="window-body">
              <p>you closed them all! happy with yourself?</p>
              <button type="button" className="default" onClick={restoreAllWindows}>
                Restore all
              </button>
            </div>
          </div>
        </div>
      )}
    </Win98WindowManagerContext.Provider>
  );
}

export function useWin98WindowManager(): Win98WindowManagerContextValue {
  const contextValue = useContext(Win98WindowManagerContext);

  if (!contextValue) {
    console.warn("useWin98WindowManager must be used inside Win98WindowManager");
    return FALLBACK_CONTEXT_VALUE;
  }

  return contextValue;
}
