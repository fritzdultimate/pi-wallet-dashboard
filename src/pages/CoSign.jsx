import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';

export default function CoSign() {
    const { api } = useAuth();
    const [credentialType, setCredentialType] = useState('mnemonic');
    const [credential, setCredential] = useState('');
    const [coSignerAddress, setCoSignerAddress] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    async function addSigner(e) {
        e.preventDefault();
        setError('');
        setResult(null);
        setBusy(true);
        try {
            const body = credentialType === 'secret'
                ? { secretKey: credential, credentialType: 'secret', coSignerAddress }
                : { mnemonic: credential, credentialType: 'mnemonic', coSignerAddress };
            const res = await api.post('/cosign/add-signer', body);
            setResult({ ok: true, hash: res.data.hash, publicKey: res.data.publicKey });
            setCredential('');
            setCoSignerAddress('');
            setConfirmed(false);
        } catch (err) {
            const data = err.response?.data;
            setError([data?.error, data?.detail].filter(Boolean).join(' - ') || 'Failed to add co-signer');
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Add a multisig co-signer</CardTitle>
            </CardHeader>

            <p className="mb-4 text-xs text-slate-400">
                Turns a wallet into a 2-of-2 multisig account: paste that wallet's own mnemonic or secret
                key (used only to sign this one change, never stored) and the public key of the co-signer
                you want to add. This builds and submits the transaction for you - no XDR needed.
            </p>

            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
                After this, moving funds from this wallet requires BOTH keys to sign. If this wallet is
                used by this dashboard's own automation (a "Main", "Funder", or "Reserve" wallet on the
                Wallets page), that automation only ever signs with the wallet's own stored credential -
                it does not know about the new co-signer. Adding one to an automated wallet will stall
                its claims/funding/sweeps until you handle the second signature yourself.
            </div>

            <form onSubmit={addSigner} className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs text-slate-400">Credential type</label>
                    <Select value={credentialType} onChange={(e) => setCredentialType(e.target.value)}>
                        <option value="mnemonic">24-word phrase</option>
                        <option value="secret">Secret key (S...)</option>
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-400">
                        Wallet to protect - {credentialType === 'secret' ? 'its secret key' : 'its 24-word recovery phrase'}
                    </label>
                    <Input
                        placeholder={credentialType === 'secret' ? 'Secret key (56 chars, starts with S)' : '24-word recovery phrase'}
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-400">New co-signer's public key</label>
                    <Input
                        placeholder="G..."
                        value={coSignerAddress}
                        onChange={(e) => setCoSignerAddress(e.target.value)}
                        required
                    />
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-400">
                    <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    I understand this wallet will require both keys to sign after this, and I have the
                    co-signer's key available separately.
                </label>
                <Button type="submit" disabled={busy || !confirmed} className="w-full">
                    {busy ? 'Submitting…' : 'Add co-signer (2-of-2)'}
                </Button>
            </form>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            {result?.ok && (
                <p className="mt-3 text-sm text-emerald-400">
                    Done. {result.publicKey} is now 2-of-2 multisig. Hash: {result.hash}
                </p>
            )}
        </Card>
    );
}