import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Select } from '../components/ui/Input.jsx';

export default function CoSign() {
    const { api } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [walletId, setWalletId] = useState('');
    const [xdr, setXdr] = useState('');
    const [signedXdr, setSignedXdr] = useState('');
    const [submitResult, setSubmitResult] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => { api.get('/wallets').then((res) => setWallets(res.data)); }, [api]);

    async function coSign(e) {
        e.preventDefault();
        setBusy(true);
        try {
            const res = await api.post('/cosign', { xdr, walletId });
            setSignedXdr(res.data.xdr);
        } catch (err) {
            setSignedXdr('');
            alert(err.response?.data?.error || 'Failed to co-sign');
        } finally {
            setBusy(false);
        }
    }

    async function submit() {
        setBusy(true);
        const res = await api.post('/cosign/submit', { xdr: signedXdr });
        setSubmitResult(res.data);
        setBusy(false);
    }

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>On-demand co-sign</CardTitle>
            </CardHeader>
            <form onSubmit={coSign} className="space-y-3">
                <textarea
                    className="h-32 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-emerald-500"
                    placeholder="Paste transaction XDR to co-sign"
                    value={xdr}
                    onChange={(e) => setXdr(e.target.value)}
                    required
                />
                <Select value={walletId} onChange={(e) => setWalletId(e.target.value)} required>
                    <option value="">Sign with…</option>
                    {wallets.map((w) => (
                        <option key={w._id} value={w._id}>{w.label}</option>
                    ))}
                </Select>
                <Button type="submit" disabled={busy} className="w-full">Add signature</Button>
            </form>

            {signedXdr && (
                <div className="mt-4 space-y-2">
                    <p className="text-xs text-slate-400">Signed XDR:</p>
                    <textarea readOnly className="h-24 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-300" value={signedXdr} />
                    <Button variant="secondary" onClick={submit} disabled={busy} className="w-full">Submit to network</Button>
                    {submitResult && (
                        <p className={`text-sm ${submitResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                            {submitResult.success ? `Submitted. Hash: ${submitResult.hash}` : submitResult.message}
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
