import { useEffect, useRef } from "react";

export function useDialog() {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  function close() {
    dialogRef.current.close();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) close();
  }

  return { dialogRef, close, handleBackdropClick };
}