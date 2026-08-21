import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Plus, RefreshCw, Trash2, ShieldAlert, Search } from 'lucide-react';

const ROLE_LABEL = {
    main: 'Main',
    funder: 'Funder (pays fees)',
    reserve: 'Reserve (pre-funds funders)',
};

function timeAgo(dateStr) {
    if (!dateStr) return 'never';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Wallets() {
    const { api } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [destinationAddress, setDestinationAddress] = useState(undefined); // undefined = not loaded yet
    const [label, setLabel] = useState('');
    const [role, setRole] = useState('main');
    const [credentialType, setCredentialType] = useState('mnemonic');
    const [credential, setCredential] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [checkingId, setCheckingId] = useState(null);
    const [checkResults, setCheckResults] = useState({}); // walletId -> { ok, message }

    async function load() {
        const [walletsRes, settingsRes] = await Promise.all([
            api.get('/wallets'),
            api.get('/settings'),
        ]);
        setWallets(walletsRes.data);
        setDestinationAddress(settingsRes.data.destinationAddress || '');
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
            // Show BOTH the human-readable reason and the underlying detail - previously
            // only the generic top-level message was shown, which hid why a secret key
            // was actually being rejected.
            const data = err.response?.data;
            const message = [data?.error, data?.detail].filter(Boolean).join(' - ');
            setError(message || 'Failed to add wallet');
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

    async function checkClaimable(id) {
        setCheckingId(id);
        try {
            const res = await api.post(`/wallets/${id}/check-claimable`);
            const { totalFound, newlyAdded, totalAmountFound } = res.data;
            const amountText = totalFound > 0 ? ` totaling ${totalAmountFound.toFixed(4)} Pi` : '';
            setCheckResults((prev) => ({
                ...prev,
                [id]: { ok: true, message: `Checked just now: ${totalFound} claimable balance(s) found on-chain${amountText} (${newlyAdded} new).` },
            }));
        } catch (err) {
            setCheckResults((prev) => ({
                ...prev,
                [id]: { ok: false, message: err.response?.data?.error || 'Check failed' },
            }));
        } finally {
            setCheckingId(null);
            await load();
        }
    }

    return (
        <div className="space-y-6">
            {destinationAddress === '' && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    No destination address is set in Settings. Claimable-balance discovery is disabled for every
                    wallet until you set one - that's why wallets may show only a balance with nothing found.
                </div>
            )}

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
                        placeholder={credentialType === 'secret' ? 'Secret key (56 chars, starts with S)' : '24-word recovery phrase'}
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
                    Adding a "Main" wallet checks for claimable balances immediately.
                </p>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your wallets ({wallets.length})</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                    {wallets.length === 0 && <p className="text-sm text-slate-500">No wallets added yet.</p>}
                    {wallets.map((w) => (
                        <div key={w._id} className="rounded-lg border border-slate-800 px-3 py-2.5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-slate-200">{w.label}</span>
                                        <Badge tone={w.role === 'main' ? 'neutral' : 'warn'}>{w.role}</Badge>
                                        {w.role === 'main' && (
                                            <Badge tone={w.claimableCount > 0 ? 'good' : 'neutral'}>
                                                {w.claimableCount || 0} claimable
                                                {w.claimableCount > 0 ? ` (${w.claimablePiTotal.toFixed(4)} Pi)` : ''}
                                            </Badge>
                                        )}
                                        {w.flagged && (
                                            <Badge tone="bad" className="gap-1">
                                                <ShieldAlert size={12} /> flagged
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-0.5 break-all font-mono text-xs text-slate-500">{w.publicKey}</p>
                                    <p className="mt-0.5 text-xs text-slate-600">
                                        Last checked: {timeAgo(w.lastCheckedAt)}
                                    </p>
                                    {w.flagged && <p className="mt-1 text-xs text-red-400">{w.flagReason}</p>}
                                    {w.lastDiscoveryError && (
                                        <p className="mt-1 text-xs text-red-400">Last check error: {w.lastDiscoveryError}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 sm:shrink-0">
                                    <span className="text-sm text-slate-300">{w.lastBalance ?? '—'} Pi</span>
                                    <button onClick={() => refreshBalance(w._id)} className="text-slate-400 hover:text-emerald-400" title="Refresh balance">
                                        <RefreshCw size={16} />
                                    </button>
                                    {w.role === 'main' && (
                                        <button
                                            onClick={() => checkClaimable(w._id)}
                                            disabled={checkingId === w._id}
                                            className="text-slate-400 hover:text-emerald-400 disabled:opacity-40"
                                            title="Check for claimable balances now"
                                        >
                                            <Search size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => removeWallet(w._id)} className="text-slate-400 hover:text-red-400" title="Remove">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            {checkResults[w._id] && (
                                <p className={`mt-2 text-xs ${checkResults[w._id].ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {checkResults[w._id].message}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}