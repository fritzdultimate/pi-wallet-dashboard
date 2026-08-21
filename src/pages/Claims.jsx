import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const statusTone = { pending: 'neutral', claiming: 'warn', claimed: 'good', failed: 'bad' };

export default function Claims() {
    const { api } = useAuth();
    const [claims, setClaims] = useState([]);

    useEffect(() => {
        api.get('/claims').then((res) => setClaims(res.data));
        const id = setInterval(() => api.get('/claims').then((res) => setClaims(res.data)), 15000);
        return () => clearInterval(id);
    }, [api]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Claimable balances ({claims.length})</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                            <th className="pb-2">Wallet</th>
                            <th className="pb-2">Amount</th>
                            <th className="pb-2">Claimable at</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Tx</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((c) => (
                            <tr key={c._id} className="border-t border-slate-800">
                                <td className="py-2 text-slate-300">{c.walletId?.label ?? '—'}</td>
                                <td className="py-2 text-slate-300">{c.amount} Pi</td>
                                <td className="py-2 text-slate-500">
                                    {c.claimableAt ? new Date(c.claimableAt).toLocaleString() : '—'}
                                </td>
                                <td className="py-2">
                                    <Badge tone={statusTone[c.status] ?? 'neutral'}>{c.status}</Badge>
                                </td>
                                <td className="py-2 font-mono text-xs text-slate-500">{c.txHash ? c.txHash.slice(0, 10) + '…' : '—'}</td>
                            </tr>
                        ))}
                        {claims.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-6 text-center text-slate-500">
                                    Nothing found yet. The scheduler checks your wallets automatically.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
