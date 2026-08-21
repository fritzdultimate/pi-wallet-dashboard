import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';

const levelTone = { info: 'neutral', warn: 'warn', error: 'bad' };

export default function Logs() {
    const { api } = useAuth();
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        api.get('/logs').then((res) => setLogs(res.data));
        const id = setInterval(() => api.get('/logs').then((res) => setLogs(res.data)), 15000);
        return () => clearInterval(id);
    }, [api]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Audit log</CardTitle>
            </CardHeader>
            <div className="max-h-[32rem] space-y-1.5 overflow-y-auto">
                {logs.map((l) => (
                    <div key={l._id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5 text-sm">
                        <Badge tone={levelTone[l.level] ?? 'neutral'} className="mt-0.5 shrink-0">{l.action}</Badge>
                        <div>
                            <p className="text-slate-300">{l.detail}</p>
                            <p className="text-xs text-slate-600">{new Date(l.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && <p className="text-sm text-slate-500">No activity logged yet.</p>}
            </div>
        </Card>
    );
}
