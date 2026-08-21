import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { Send as SendIcon } from 'lucide-react';

export default function Send() {
    const { api } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [fromWalletId, setFromWalletId] = useState('');
    const [destination, setDestination] = useState('');
    const [amount, setAmount] = useState('');
    const [quote, setQuote] = useState(null);
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.get('/wallets').then((res) => setWallets(res.data));
        api.get('/payments/quote').then((res) => setQuote(res.data));
    }, [api]);

    async function send(e) {
        e.preventDefault();
        setBusy(true);
        setResult(null);
        try {
            const res = await api.post('/payments/send', { fromWalletId, destination, amount });
            setResult({ ok: true, hash: res.data.hash });
        } catch (err) {
            setResult({ ok: false, message: err.response?.data?.message || 'Send failed' });
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Send Pi</CardTitle>
            </CardHeader>
            <form onSubmit={send} className="space-y-3">
                <Select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} required>
                    <option value="">From wallet…</option>
                    {wallets.map((w) => (
                        <option key={w._id} value={w._id}>{w.label} ({w.lastBalance ?? '—'} Pi)</option>
                    ))}
                </Select>
                <Input placeholder="Destination address" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                <Input type="number" step="0.0000001" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                {quote && (
                    <p className="text-xs text-slate-500">
                        Fee: {quote.feePi} Pi
                        {quote.feeMode === 'fixed' ? ' (fixed - set in Settings)' : ' (auto: live network fee + your buffer)'}
                    </p>
                )}
                <Button type="submit" disabled={busy} className="w-full">
                    <SendIcon size={16} /> {busy ? 'Sending…' : 'Send'}
                </Button>
                {result && (
                    <p className={`text-sm ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.ok ? `Sent. Hash: ${result.hash}` : result.message}
                    </p>
                )}
            </form>
        </Card>
    );
}
