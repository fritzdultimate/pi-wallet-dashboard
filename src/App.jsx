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
            <header className="flex items-center justify-between border-b border-slate-800 px-4 py-4 sm:px-6">
                <h1 className="text-sm font-semibold text-slate-100">Pi Wallet Dashboard</h1>
                <button onClick={logout} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400">
                    <LogOut size={14} /> Sign out
                </button>
            </header>

            <div className="flex flex-col gap-4 px-4 py-4 sm:mx-auto sm:max-w-6xl sm:flex-row sm:gap-6 sm:px-6 sm:py-6">
                {/* Below sm: a horizontally-scrollable tab strip. At sm+: a fixed vertical sidebar.
                    The old fixed-width row-flex nav squeezed content into almost nothing on phones -
                    this is the direct fix for that. */}
                <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:w-44 sm:shrink-0 sm:flex-col sm:space-y-1 sm:overflow-visible sm:px-0 sm:pb-0">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActive(key)}
                            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors sm:w-full ${
                                active === key ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            }`}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </nav>

                <main className="min-w-0 flex-1">
                    <ActiveComponent />
                </main>
            </div>
        </div>
    );
}