'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';
export type AlertPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'bottom-center'
  | 'top-center';

export interface PopUpAlertProps {
  message: string;
  type?: AlertType;
  position?: AlertPosition; // Default 'bottom-right' (Kanan Bawah)
  duration?: number; // Default 2000ms (2 detik)
  onClose: () => void;
}

export default function PopUpAlert({
  message,
  type = 'success',
  position = 'bottom-right',
  duration = 2000,
  onClose,
}: PopUpAlertProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6 animate-toast-in-bottom';
      case 'bottom-left':
        return 'bottom-6 left-6 animate-toast-in-bottom';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2 animate-toast-in-bottom';
      case 'top-left':
        return 'top-6 left-6 animate-toast-in';
      case 'top-center':
        return 'top-6 left-1/2 -translate-x-1/2 animate-toast-in';
      case 'top-right':
        return 'top-6 right-6 animate-toast-in';
      default:
        return 'bottom-6 right-6 animate-toast-in-bottom';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`fixed z-[9999] max-w-md w-[calc(100vw-3rem)] pointer-events-auto ${getPositionClasses()}`}
    >
      <div className="relative bg-white border border-slate-200/80 shadow-2xl shadow-slate-900/15 rounded-xl overflow-hidden p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pr-2 min-w-0">
          <div className="p-1.5 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <span className="text-slate-800 text-sm font-medium leading-snug break-words">
            {message}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar Indikator 2 Detik */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
            <div
              className={`h-full ${getProgressBarColor()} animate-toast-progress`}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
