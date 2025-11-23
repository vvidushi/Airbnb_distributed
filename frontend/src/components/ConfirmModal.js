import React from 'react';

const getTypeClasses = (type) => {
  switch (type) {
    case 'danger':
      return {
        accent: 'text-red-600',
        button: 'bg-red-500 hover:bg-red-600',
      };
    case 'success':
      return {
        accent: 'text-green-600',
        button: 'bg-green-500 hover:bg-green-600',
      };
    case 'warning':
    default:
      return {
        accent: 'text-yellow-600',
        button: 'bg-yellow-500 hover:bg-yellow-600',
      };
  }
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const { accent, button } = getTypeClasses(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${accent}`}>{title}</h3>
        </div>
        <div className="px-6 py-4 bg-white">
          <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;