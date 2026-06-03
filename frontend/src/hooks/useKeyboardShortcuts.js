import { useEffect, useCallback } from 'react';

export default function useKeyboardShortcuts(shortcuts = {}) {
  const handleKeyDown = useCallback((e) => {
    // Don't trigger shortcuts when typing in inputs
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      // Allow Escape in inputs
      if (e.key !== 'Escape') return;
    }

    const key = [];
    if (e.ctrlKey) key.push('ctrl');
    if (e.altKey) key.push('alt');
    if (e.shiftKey) key.push('shift');
    key.push(e.key.toLowerCase());
    const combo = key.join('+');

    if (shortcuts[combo]) {
      e.preventDefault();
      shortcuts[combo]();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// POS-specific shortcuts
export const POS_SHORTCUTS = {
  'f2': 'Tìm kiếm sản phẩm',
  'f5': 'Thanh toán',
  'escape': 'Hủy / Đóng modal',
  'ctrl+n': 'Tạo đơn mới',
  'ctrl+p': 'In hóa đơn',
  'ctrl+d': 'Xóa sản phẩm khỏi giỏ',
};

export const SHORTCUT_LABELS = {
  'f2': 'F2',
  'f5': 'F5',
  'escape': 'Esc',
  'ctrl+n': 'Ctrl+N',
  'ctrl+p': 'Ctrl+P',
  'ctrl+d': 'Ctrl+D',
};