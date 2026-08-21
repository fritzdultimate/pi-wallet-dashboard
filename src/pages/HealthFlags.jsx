import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export default function HealthFlags() {
    const { api } = useAuth();
    const [funders, setFunders] = useState([]);

    useEffect(() => { api.get('/health/funders').then((res) => setFunders(res.data)); }, [api]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Funder wallet health</CardTitle>
            </CardHeader>
            <div className="space-y-2">
                {funders.map((f) => (
                    <div key={f.id} className="rounded-lg border border-slate-800 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-200">{f.label}</span>
                            <Badge tone={f.safe ? 'good' : 'bad'}>{f.score}/100</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{f.balance} Pi</p>
                        {f.reasons.length > 0 && (
                            <ul className="mt-1 list-inside list-disc text-xs text-amber-400">
                                {f.reasons.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
                {funders.length === 0 && <p className="text-sm text-slate-500">No funder wallets added yet.</p>}
            </div>
        </Card>
    );
}
