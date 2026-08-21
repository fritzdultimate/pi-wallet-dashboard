import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { createApiClient } from '../lib/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Card } from '../components/ui/Card.jsx';

export default function Login() {
    const { login } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const client = createApiClient(null);
            const res = await client.post('/auth/login', { password });
            login(res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <h1 className="mb-1 text-lg font-semibold text-slate-100">Pi Wallet Dashboard</h1>
                <p className="mb-5 text-sm text-slate-500">Single-owner access only.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
