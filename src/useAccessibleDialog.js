import { useEffect, useRef } from "react";

const openDialogs = [];
const inertElements = new Map();
let originalBodyOverflow;

const tabbableSelector = [
  "a[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "[tabindex]",
  "[contenteditable='true']",
].join(",");

function getTabbableElements(dialog) {
  return Array.from(dialog.querySelectorAll(tabbableSelector)).filter((element) => {
    const style = window.getComputedStyle(element);
    return element.tabIndex >= 0 && !element.matches(":disabled") &&
      !element.closest("[inert]") && element.getClientRects().length > 0 &&
      style.visibility !== "hidden" && style.visibility !== "collapse";
  });
}

function makeBackgroundInert(dialog) {
  const affected = [];
  let branch = dialog;
  while (branch.parentElement && branch !== document.body) {
    for (const sibling of branch.parentElement.children) {
      if (sibling === branch || !(sibling instanceof HTMLElement)) continue;
      const record = inertElements.get(sibling) || { count: 0, wasInert: sibling.inert };
      record.count += 1;
      inertElements.set(sibling, record);
      sibling.inert = true;
      affected.push(sibling);
    }
    branch = branch.parentElement;
  }
  return () => {
    for (const element of affected) {
      const record = inertElements.get(element);
      record.count -= 1;
      if (record.count === 0) {
        element.inert = record.wasInert;
        inertElements.delete(element);
      }
    }
  };
}

/** Use on the mounted element with role="dialog", aria-modal and an accessible name. */
export default function useAccessibleDialog(dialogRef, isOpen, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return undefined;

    const previouslyFocused = document.activeElement;
    const originalTabIndex = dialog.getAttribute("tabindex");
    if (originalTabIndex === null) dialog.tabIndex = -1;

    if (openDialogs.length === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openDialogs.push(dialog);
    const restoreBackground = makeBackgroundInert(dialog);
    const isTopDialog = () => openDialogs.at(-1) === dialog;
    const focusFirst = () => {
      const initial = dialog.querySelector("[data-dialog-initial-focus]");
      (initial || getTabbableElements(dialog)[0] || dialog).focus({ preventScroll: true });
    };

    const frame = window.requestAnimationFrame(() => {
      if (isTopDialog()) focusFirst();
    });

    const onKeyDown = (event) => {
      if (!isTopDialog()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = getTabbableElements(dialog);
      const first = controls[0];
      const last = controls.at(-1);
      const active = document.activeElement;
      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && (active === first || !controls.includes(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !controls.includes(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (event) => {
      if (isTopDialog() && !dialog.contains(event.target)) focusFirst();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn, true);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      const wasTopDialog = isTopDialog();
      openDialogs.splice(openDialogs.lastIndexOf(dialog), 1);
      restoreBackground();
      if (openDialogs.length === 0) document.body.style.overflow = originalBodyOverflow;
      if (originalTabIndex === null) dialog.removeAttribute("tabindex");
      if (wasTopDialog && previouslyFocused instanceof HTMLElement &&
          previouslyFocused.isConnected && !previouslyFocused.closest("[inert]")) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [dialogRef, isOpen]);
}
