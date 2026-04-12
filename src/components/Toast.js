import { useState, useCallback, useRef } from 'react';

let _showToast = null;

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const showToast = useCallback((msg, err = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, err });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);
  _showToast = showToast;
  return { toast, showToast };
}

export function showToast(msg, err = false) {
  if (_showToast) _showToast(msg, err);
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast" style={{ background: toast.err ? '#A32D2D' : '#1D9E75' }}>
      {toast.msg}
    </div>
  );
}
