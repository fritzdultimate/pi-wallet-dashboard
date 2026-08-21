import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';

export default function SettingsPage() {
    const { api } = useAuth();
    const [settings, setSettings] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => { api.get('/settings').then((res) => setSettings(res.data)); }, [api]);

    async function save(e) {
        e.preventDefault();
        const res = await api.put('/settings', settings);
        setSettings(res.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    if (!settings) return null;

    return (
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <form onSubmit={save} className="space-y-4">
                <div>
                    <label className="mb-1 block text-xs text-slate-400">Destination address for claims</label>
                    <Input
                        value={settings.destinationAddress || ''}
                        onChange={(e) => setSettings({ ...settings, destinationAddress: e.target.value })}
                        placeholder="G..."
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-400">Fee mode</label>
                    <Select
                        value={settings.feeMode || 'auto'}
                        onChange={(e) => setSettings({ ...settings, feeMode: e.target.value })}
                    >
                        <option value="auto">Auto (live network fee + buffer)</option>
                        <option value="fixed">Fixed (set the exact fee myself)</option>
                    </Select>
                    <p className="mt-1 text-xs text-slate-500">
                        Applies per operation - stellar-base multiplies this by however many operations
                        a transaction has, so a 2-operation claim costs roughly double a 1-operation send.
                    </p>
                </div>
                {settings.feeMode === 'fixed' ? (
                    <div>
                        <label className="mb-1 block text-xs text-slate-400">Fixed fee per operation (Pi)</label>
                        <Input
                            type="number"
                            step="0.001"
                            value={settings.fixedFeePi}
                            onChange={(e) => setSettings({ ...settings, fixedFeePi: Number(e.target.value) })}
                        />
                        <p className="mt-1 text-xs text-amber-400">
                            Ignores the live network fee entirely. Raise this to intentionally pay more for priority.
                        </p>
                    </div>
                ) : (
                    <div>
                        <label className="mb-1 block text-xs text-slate-400">Extra buffer on top of live fee (Pi)</label>
                        <Input
                            type="number"
                            step="0.001"
                            value={settings.extraFee}
                            onChange={(e) => setSettings({ ...settings, extraFee: Number(e.target.value) })}
                        />
                    </div>
                )}
                <div>
                    <label className="mb-1 block text-xs text-slate-400">Minimum funder balance (Pi)</label>
                    <Input
                        type="number"
                        step="0.1"
                        value={settings.minFunderBalance}
                        onChange={(e) => setSettings({ ...settings, minFunderBalance: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-slate-400">Poll interval (ms)</label>
                    <Input
                        type="number"
                        step="1000"
                        value={settings.pollIntervalMs}
                        onChange={(e) => setSettings({ ...settings, pollIntervalMs: Number(e.target.value) })}
                    />
                </div>
                <Button type="submit" className="w-full">Save</Button>
                {saved && <p className="text-sm text-emerald-400">Saved.</p>}
            </form>
        </Card>
    );
}
