"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { useWin98WindowManager } from "./Win98WindowManager";

interface Win98WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  showMinimize?: boolean;
  showMaximize?: boolean;
  statusBar?: ReactNode;
  windowId?: string;
}

export function Win98Window({
  title,
  children,
  className,
  showMinimize = false,
  showMaximize = false,
  statusBar,
  windowId,
}: Readonly<Win98WindowProps>) {
  const [isMinimized, setIsMinimized] = useState(false);
  const generatedWindowId = useId();
  const resolvedWindowId = windowId ?? generatedWindowId;
  const { hiddenWindowIds, hideWindow, registerWindow, unregisterWindow } = useWin98WindowManager();
  const isHidden = hiddenWindowIds.has(resolvedWindowId);

  useEffect(() => {
    registerWindow(resolvedWindowId);

    return () => unregisterWindow(resolvedWindowId);
  }, [registerWindow, resolvedWindowId, unregisterWindow]);

  if (isHidden) {
    return null;
  }

  return (
    <div className={className ? `window ${className}` : "window"}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          {showMinimize && (
            <button
              type="button"
              aria-label="Minimize"
              onClick={() => setIsMinimized(true)}
            ></button>
          )}
          {showMaximize && (
            <button
              type="button"
              aria-label="Maximize"
              onClick={() => setIsMinimized(false)}
            ></button>
          )}
          <button type="button" aria-label="Close" onClick={() => hideWindow(resolvedWindowId)}></button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="window-body">{children}</div>
          {statusBar}
        </>
      )}
    </div>
  );
}
