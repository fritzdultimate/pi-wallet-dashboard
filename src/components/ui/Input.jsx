import { cn } from '../../lib/utils.js';

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-500',
                className
            )}
            {...props}
        />
    );
}

export function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(
                'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500',
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
}
