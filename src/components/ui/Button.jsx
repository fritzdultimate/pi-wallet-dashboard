import { cn } from '../../lib/utils.js';

const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
};

export function Button({ variant = 'primary', className, ...props }) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
