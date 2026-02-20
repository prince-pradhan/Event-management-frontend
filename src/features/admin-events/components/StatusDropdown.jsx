import React from 'react';
import { EVENT_STATUS } from '../../../utils/constants';

const StatusDropdown = ({ status, onChange, className = "" }) => {
    const getStatusStyles = (s) => {
        switch (s) {
            case EVENT_STATUS.PUBLISHED:
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            case EVENT_STATUS.DRAFT:
                return 'bg-amber-50 text-amber-700 ring-amber-600/20';
            case EVENT_STATUS.CANCELLED:
                return 'bg-red-50 text-red-700 ring-red-600/20';
            default:
                return 'bg-slate-50 text-slate-600 ring-slate-500/10';
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => onChange(e.target.value)}
            className={`block w-full max-w-[140px] rounded-lg border-0 py-1.5 pl-3 pr-8 text-xs font-semibold ring-1 ring-inset ${getStatusStyles(status)} focus:ring-2 focus:ring-primary-600 sm:leading-6 ${className}`}
        >
            {Object.values(EVENT_STATUS).map((s) => (
                <option key={s} value={s}>
                    {s}
                </option>
            ))}
        </select>
    );
};

export default StatusDropdown;
