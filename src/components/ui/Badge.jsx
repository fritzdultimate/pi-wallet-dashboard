import { cn } from '../../lib/utils.js';

const tones = {
    neutral: 'bg-slate-800 text-slate-300',
    good: 'bg-emerald-500/15 text-emerald-400',
    warn: 'bg-amber-500/15 text-amber-400',
    bad: 'bg-red-500/15 text-red-400',
};

export function Badge({ tone = 'neutral', className, ...props }) {
    return (
        <span
            className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}
            {...props}
        />
    );
}
