import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Plus, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

const ROLE_LABEL = {
    main: 'Main',
    funder: 'Funder (pays fees)',
    reserve: 'Reserve (pre-funds funders)',
};

export default function Wallets() {
    const { api } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [label, setLabel] = useState('');
    const [role, setRole] = useState('main');
    const [credentialType, setCredentialType] = useState('mnemonic');
    const [credential, setCredential] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    async function load() {
        const res = await api.get('/wallets');
        setWallets(res.data);
    }

    useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function addWallet(e) {
        e.preventDefault();
        setError('');
        setBusy(true);
        try {
            const body = credentialType === 'secret'
                ? { label, role, secretKey: credential, credentialType: 'secret' }
                : { label, role, mnemonic: credential, credentialType: 'mnemonic' };
            await api.post('/wallets', body);
            setLabel('');
            setCredential('');
            await load();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add wallet');
        } finally {
            setBusy(false);
        }
    }

    async function removeWallet(id) {
        if (!confirm('Remove this wallet? This does not affect the wallet on-chain, only this dashboard.')) return;
        await api.delete(`/wallets/${id}`);
        await load();
    }

    async function refreshBalance(id) {
        await api.get(`/wallets/${id}/balance`);
        await load();
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add a wallet you hold the keys to</CardTitle>
                </CardHeader>
                <form onSubmit={addWallet} className="grid gap-3 sm:grid-cols-4">
                    <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} required />
                    <Select value={role} onChange={(e) => setRole(e.target.value)}>
                        {Object.entries(ROLE_LABEL).map(([value, text]) => (
                            <option key={value} value={value}>{text}</option>
                        ))}
                    </Select>
                    <Select value={credentialType} onChange={(e) => setCredentialType(e.target.value)}>
                        <option value="mnemonic">24-word phrase</option>
                        <option value="secret">Secret key (S...)</option>
                    </Select>
                    <Input
                        placeholder={credentialType === 'secret' ? 'Secret key (starts with S)' : '24-word recovery phrase'}
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={busy} className="sm:col-span-4">
                        <Plus size={16} /> Add wallet
                    </Button>
                </form>
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                <p className="mt-3 text-xs text-slate-500">
                    Stored encrypted at rest. Never transmitted anywhere except to this server, over your own connection.
                </p>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your wallets ({wallets.length})</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                    {wallets.length === 0 && <p className="text-sm text-slate-500">No wallets added yet.</p>}
                    {wallets.map((w) => (
                        <div key={w._id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2.5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-200">{w.label}</span>
                                    <Badge tone={w.role === 'main' ? 'neutral' : 'warn'}>{w.role}</Badge>
                                    {w.flagged && (
                                        <Badge tone="bad" className="gap-1">
                                            <ShieldAlert size={12} /> flagged
                                        </Badge>
                                    )}
                                </div>
                                <p className="mt-0.5 font-mono text-xs text-slate-500">{w.publicKey}</p>
                                {w.flagged && <p className="mt-1 text-xs text-red-400">{w.flagReason}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-300">{w.lastBalance ?? '—'} Pi</span>
                                <button onClick={() => refreshBalance(w._id)} className="text-slate-400 hover:text-emerald-400" title="Refresh balance">
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={() => removeWallet(w._id)} className="text-slate-400 hover:text-red-400" title="Remove">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}