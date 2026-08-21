import { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Wallets from './pages/Wallets.jsx';
import Claims from './pages/Claims.jsx';
import Send from './pages/Send.jsx';
import SettingsPage from './pages/Settings.jsx';
import Backup from './pages/Backup.jsx';
import CoSign from './pages/CoSign.jsx';
import HealthFlags from './pages/HealthFlags.jsx';
import Logs from './pages/Logs.jsx';
import { Wallet, ListChecks, Send as SendIcon, Settings, Download, PenTool, ShieldCheck, ScrollText, LogOut } from 'lucide-react';

const TABS = [
    { key: 'wallets', label: 'Wallets', icon: Wallet, Component: Wallets },
    { key: 'claims', label: 'Claims', icon: ListChecks, Component: Claims },
    { key: 'send', label: 'Send', icon: SendIcon, Component: Send },
    { key: 'health', label: 'Health', icon: ShieldCheck, Component: HealthFlags },
    { key: 'backup', label: 'Backup', icon: Download, Component: Backup },
    { key: 'cosign', label: 'Co-sign', icon: PenTool, Component: CoSign },
    { key: 'logs', label: 'Logs', icon: ScrollText, Component: Logs },
    { key: 'settings', label: 'Settings', icon: Settings, Component: SettingsPage },
];

export default function App() {
    const { token, logout } = useAuth();
    const [active, setActive] = useState('wallets');

    if (!token) return <Login />;

    const ActiveComponent = TABS.find((t) => t.key === active)?.Component ?? Wallets;

    return (
        <div className="min-h-screen bg-slate-950">
            <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <h1 className="text-sm font-semibold text-slate-100">Pi Wallet Dashboard</h1>
                <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400">
                    <LogOut size={14} /> Sign out
                </button>
            </header>

            <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
                <nav className="w-44 shrink-0 space-y-1">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActive(key)}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                active === key ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </nav>

                <main className="flex-1">
                    <ActiveComponent />
                </main>
            </div>
        </div>
    );
}
