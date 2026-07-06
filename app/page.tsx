'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [server, setServer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'players' | 'console'>('stats');

  // Каждые 2 секунды запрашиваем обновленный стейт сервера
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        const data = await res.json();
        if (data.online) setServer(data);
      } catch (e) { console.error("Ошибка загрузки стейта"); }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Отправка экшена в очередь бэкенда Vercel
  const triggerAction = async (actionData: string) => {
    await fetch('/api/admin/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionData }),
    });
  };

  if (!server) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-3 bg-[#0e1621]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-sm text-gray-400">Ожидание синхронизации с сервером...</p>
      </div>
    );
  }

  const { stats, players, customConsoleCommands, customPlayerCommands } = server;

  return (
    <div className="min-h-screen bg-[#0e1621] pb-24 text-slate-100">
      {/* Шапка */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#17212b]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base text-blue-400">🤖 TelegramSRV Lite Panel</h1>
            <p className="text-xs text-slate-400">{stats.serverIp}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            ⚫ Online
          </span>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Внутренняя навигация в стиле TMA приложений */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#17212b] p-1 border border-slate-800">
          {(['stats', 'players', 'console'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'stats' ? '📊 Сводка' : tab === 'players' ? '👥 Игроки' : '💻 Консоль'}
            </button>
          ))}
        </div>

        {/* ВКЛАДКА 1: СВОДКА СТАТИСТИКИ */}
        {activeTab === 'stats' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-[#17212b] p-3">
                <p className="text-xs text-slate-400">Стабильность</p>
                <p className="mt-1 font-mono text-xl font-bold text-amber-400">{stats.tps.toFixed(2)} <span className="text-xs text-slate-500">TPS</span></p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#17212b] p-3">
                <p className="text-xs text-slate-400">Онлайн игроков</p>
                <p className="mt-1 text-xl font-bold text-blue-400">{stats.onlineCount} <span className="text-xs text-slate-500">/ {stats.maxPlayers}</span></p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#17212b] p-4 space-y-2">
              <div className="flex justify-between text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Аптайм машины:</span>
                <span className="font-mono text-slate-200">{stats.uptime}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">Потребление ОЗУ:</span>
                <span className="font-mono text-slate-200">{stats.usedMemory} МБ</span>
              </div>
            </div>

            {stats.announcement && (
              <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-xs text-blue-300">
                📌 <strong>Объявление:</strong> {stats.announcement}
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА 2: УПРАВЛЕНИЕ ИГРОКАМИ */}
        {activeTab === 'players' && (
          <div className="space-y-3 animate-fadeIn">
            {players.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">На сервере сейчас пусто</p>
            ) : (
              players.map((p: any) => (
                <div key={p.name} className="rounded-xl border border-slate-800 bg-[#17212b] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-200">👤 {p.name}</h3>
                      <p className="text-xs text-slate-500">Мир: {p.world} ({p.x}, {p.y}, {p.z})</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{p.ping} ms</span>
                  </div>

                  {/* Быстрые действия над выбранным игроком из твоего обработчика плагина */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button onClick={() => triggerAction(`act:gm1:${p.name}`)} className="rounded-md bg-slate-800 py-1.5 text-xs font-medium text-purple-400 hover:bg-slate-700">Creative</button>
                    <button onClick={() => triggerAction(`act:gm0:${p.name}`)} className="rounded-md bg-slate-800 py-1.5 text-xs font-medium text-emerald-400 hover:bg-slate-700">Survival</button>
                    <button onClick={() => triggerAction(`act:kick:${p.name}`)} className="rounded-md bg-red-950/40 border border-red-900/50 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/30">Kick</button>
                  </div>

                  {/* Рендеринг кастомных кнопок для игроков из твоего yml конфига */}
                  {customPlayerCommands.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/50">
                      {customPlayerCommands.map((cmdStr: string, idx: number) => {
                        const label = cmdStr.split('|')[0];
                        return (
                          <button
                            key={idx}
                            onClick={() => triggerAction(`run_p_cmd:${idx}:${p.name}`)}
                            className="rounded bg-blue-950/40 border border-blue-900/40 px-2 py-1 text-[11px] text-blue-400 hover:bg-blue-900/20"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ВКЛАДКА 3: ТЕРМИНАЛ И КАСТОМНЫЕ КНОПКИ КОНСОЛИ */}
        {activeTab === 'console' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Опасные системные команды */}
            <div className="rounded-xl border border-slate-800 bg-[#17212b] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Системные триггеры</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => triggerAction('term_reload')} className="rounded-lg bg-slate-800 p-2.5 text-xs font-medium text-blue-400 hover:bg-slate-700">
                  🔄 Релоад плагина
                </button>
                <button onClick={() => { if(confirm("Выключить сервер?")) triggerAction('term_stop') }} className="rounded-lg bg-red-950/30 border border-red-900/40 p-2.5 text-xs font-medium text-red-400 hover:bg-red-900/20">
                  🛑 Стоп сервера
                </button>
              </div>
            </div>

            {/* Твои динамические кнопки из custom-console-commands в config.yml */}
            <div className="rounded-xl border border-slate-800 bg-[#17212b] p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Консольные макросы</h4>
              {customConsoleCommands.length === 0 ? (
                <p className="text-xs text-slate-500">Макросы не настроены в config.yml</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {customConsoleCommands.map((cmdStr: string, idx: number) => {
                    const label = cmdStr.split('|')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => triggerAction(`run_c_cmd:${idx}`)}
                        className="flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2.5 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        <span>⚙️ {label}</span>
                        <span className="text-[10px] font-mono text-slate-500">ID: {idx}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
