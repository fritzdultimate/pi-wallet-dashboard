import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Download } from 'lucide-react';

export default function Backup() {
    const { api } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [selected, setSelected] = useState([]);
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { api.get('/wallets').then((res) => setWallets(res.data)); }, [api]);

    function toggle(id) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    }

    async function download(e) {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Backup password must be at least 8 characters.');
            return;
        }
        setBusy(true);
        try {
            const res = await api.post('/backup', { walletIds: selected, password });
            const blob = new Blob([JSON.stringify(res.data.backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pi-wallet-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.error || 'Backup failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Download encrypted key backup</CardTitle>
            </CardHeader>
            <div className="mb-4 space-y-1.5">
                {wallets.map((w) => (
                    <label key={w._id} className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={selected.includes(w._id)} onChange={() => toggle(w._id)} />
                        {w.label} <span className="text-xs text-slate-500">({w.role})</span>
                    </label>
                ))}
                {wallets.length === 0 && <p className="text-sm text-slate-500">No wallets to back up yet.</p>}
            </div>
            <form onSubmit={download} className="space-y-3">
                <Input
                    type="password"
                    placeholder="Backup file password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <p className="text-xs text-slate-500">
                    Leave nothing selected to back up all wallets. The file is encrypted with this password and nothing
                    is kept server-side - if you lose the password, the backup is unrecoverable.
                </p>
                <Button type="submit" disabled={busy} className="w-full">
                    <Download size={16} /> {busy ? 'Preparing…' : 'Download backup'}
                </Button>
                {error && <p className="text-sm text-red-400">{error}</p>}
            </form>
        </Card>
    );
}
