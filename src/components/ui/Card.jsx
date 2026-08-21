import { cn } from '../../lib/utils.js';

export function Card({ className, ...props }) {
    return (
        <div
            className={cn('rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm', className)}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }) {
    return <div className={cn('mb-4 flex items-center justify-between', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
    return <h3 className={cn('text-sm font-semibold tracking-wide text-slate-200', className)} {...props} />;
}
