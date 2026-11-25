import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, XCircle, Plus, RefreshCw, 
  Settings, Terminal, FileText, BookOpen, GitBranch, Shield, Cpu, 
  Clock, Copy, Check, Trash2, Edit3, Send, ExternalLink, Play, AlertCircle
} from 'lucide-react';

interface PingLog {
  id: string;
  timestamp: string;
  type: 'success' | 'start' | 'fail';
  durationMs: number;
}

interface CheckItem {
  id: string;
  name: string;
  tags: string[];
  schedule: string;
  grace: string;
  status: 'up' | 'down' | 'grace' | 'new';
  lastPing: string | null;
  pingUrl: string;
  pingsCount: number;
  logs: PingLog[];
}

const INITIAL_CHECKS: CheckItem[] = [
  {
    id: 'c1',
    name: 'Backup Diário do Banco de Dados',
    tags: ['banco-de-dados', 'producao'],
    schedule: '0 2 * * * (Todo dia às 02:00)',
    grace: '15 minutos',
    status: 'up',
    lastPing: 'Há 2 horas',
    pingUrl: 'https://hc-ping.com/b17f-4a21-99c1-backup',
    pingsCount: 142,
    logs: [
      { id: 'l1', timestamp: 'Hoje, 02:00', type: 'success', durationMs: 4120 },
      { id: 'l2', timestamp: 'Ontem, 02:00', type: 'success', durationMs: 3890 }
    ]
  },
  {
    id: 'c2',
    name: 'Sincronização Webhook Stripe',
    tags: ['pagamentos', 'api'],
    schedule: 'A cada 10 minutos',
    grace: '2 minutos',
    status: 'up',
    lastPing: 'Há 4 min',
    pingUrl: 'https://hc-ping.com/f82a-3b12-88e4-stripe',
    pingsCount: 1845,
    logs: [
      { id: 'l3', timestamp: 'Hoje, 06:54', type: 'success', durationMs: 240 },
      { id: 'l4', timestamp: 'Hoje, 06:44', type: 'success', durationMs: 195 }
    ]
  },
  {
    id: 'c3',
    name: 'Lote Noturno de Faturamento',
    tags: ['financeiro'],
    schedule: '0 4 * * *',
    grace: '30 minutos',
    status: 'down',
    lastPing: 'Há 26 horas',
    pingUrl: 'https://hc-ping.com/c93d-2e11-4190-invoice',
    pingsCount: 89,
    logs: [
      { id: 'l5', timestamp: 'Ontem, 04:05', type: 'fail', durationMs: 15200 }
    ]
  },
  {
    id: 'c4',
    name: 'Aquecimento de Cache (Worker)',
    tags: ['desempenho'],
    schedule: 'A cada 30 minutos',
    grace: '5 minutos',
    status: 'grace',
    lastPing: 'Há 34 min',
    pingUrl: 'https://hc-ping.com/e77b-9f01-3321-cache',
    pingsCount: 620,
    logs: [
      { id: 'l6', timestamp: 'Hoje, 06:20', type: 'start', durationMs: 50 },
      { id: 'l7', timestamp: 'Hoje, 05:50', type: 'success', durationMs: 820 }
    ]
  }
];

const DOC_PATHS: Record<string, string> = {
  readme: '/README.md',
  discovery: '/01-discovery/README.md',
  processo: '/02-processo/README.md',
  requisitos: '/03-requisitos/README.md',
  uml: '/04-uml/README.md',
  evolucao: '/05-evolucao/README.md',
  implementacao: '/06-implementacao/README.md',
  etica: '/07-etica/README.md',
  ia: '/ia.md',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'archaeology'>('dashboard');
  const [archaeologySubTab, setArchaeologySubTab] = useState<string>('readme');
  const [docContent, setDocContent] = useState<string>('Carregando documentação...');
  const [docLoading, setDocLoading] = useState<boolean>(false);

  const [checks, setChecks] = useState<CheckItem[]>(INITIAL_CHECKS);
  const [selectedCheck, setSelectedCheck] = useState<CheckItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulationTargetId, setSimulationTargetId] = useState<string>(INITIAL_CHECKS[0].id);
  const [simulationType, setSimulationType] = useState<'success' | 'start' | 'fail'>('success');
  const [notification, setNotification] = useState<string | null>(null);

  // New Check Form State
  const [newCheckName, setNewCheckName] = useState('');
  const [newCheckSchedule, setNewCheckSchedule] = useState('A cada 1 hora');
  const [newCheckTags, setNewCheckTags] = useState('producao');

  // Fetch documentation dynamically whenever archaeologySubTab changes
  useEffect(() => {
    const path = DOC_PATHS[archaeologySubTab];
    if (!path) return;
    setDocLoading(true);
    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error('Documento não encontrado');
        return res.text();
      })
      .then(text => {
        setDocContent(text);
        setDocLoading(false);
      })
      .catch(err => {
        setDocContent(`# Erro\nNão foi possível carregar o arquivo (${path}).`);
        setDocLoading(false);
      });
  }, [archaeologySubTab]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckName.trim()) return;
    const newCheck: CheckItem = {
      id: 'c_' + Date.now(),
      name: newCheckName,
      tags: newCheckTags.split(',').map(t => t.trim()).filter(Boolean),
      schedule: newCheckSchedule,
      grace: '5 minutos',
      status: 'new',
      lastPing: null,
      pingUrl: `https://hc-ping.com/${Math.random().toString(36).substring(2, 10)}`,
      pingsCount: 0,
      logs: []
    };
    setChecks([newCheck, ...checks]);
    setIsModalOpen(false);
    setNewCheckName('');
    showToast('Checagem criada com sucesso!');
  };

  const handleSimulatePing = (e: React.FormEvent) => {
    e.preventDefault();
    setChecks(checks.map(c => {
      if (c.id === simulationTargetId) {
        const now = 'Agora mesmo';
        const newStatus = simulationType === 'fail' ? 'down' : 'up';
        const newLog: PingLog = {
          id: 'l_' + Date.now(),
          timestamp: 'Agora mesmo',
          type: simulationType,
          durationMs: Math.floor(Math.random() * 1500) + 100
        };
        return {
          ...c,
          status: newStatus,
          lastPing: now,
          pingsCount: c.pingsCount + 1,
          logs: [newLog, ...c.logs]
        };
      }
      return c;
    }));
    setIsSimulateModalOpen(false);
    showToast(`Ping simulado com sucesso como [${simulationType.toUpperCase()}]!`);
  };

  const handleDeleteCheck = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta checagem?')) {
      setChecks(checks.filter(c => c.id !== id));
      if (selectedCheck?.id === id) setSelectedCheck(null);
      showToast('Checagem excluída.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white">Healthchecks & Arqueologia</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">CSI412 UFOP</span>
              </div>
              <p className="text-xs text-slate-400">Monitoramento de Tarefas & Projeto de Arqueologia de Software</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  activeTab === 'dashboard' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                Painel de Monitoramento
              </button>
              <button
                onClick={() => setActiveTab('archaeology')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  activeTab === 'archaeology' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Arqueologia de Software (Docs ao Vivo)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total de Checagens</p>
                  <p className="text-3xl font-bold text-white mt-1">{checks.length}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-400">Ativos / Saudáveis</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">
                    {checks.filter(c => c.status === 'up' || c.status === 'grace').length}
                  </p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-400">Inativos / Alerta</p>
                  <p className="text-3xl font-bold text-rose-400 mt-1">
                    {checks.filter(c => c.status === 'down').length}
                  </p>
                </div>
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-400">Integração</p>
                  <p className="text-3xl font-bold text-amber-400 mt-1">HTTP / Webhooks</p>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400">
                  <Terminal className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-lg font-semibold text-white">Tarefas Cron e Serviços Monitorados</h2>
                <p className="text-xs text-slate-400">Monitoramento de batimentos cardíacos (heartbeat) para scripts de backend, backups e rotinas agendadas.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSimulateModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-medium text-sm border border-slate-700 transition flex items-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  Simular Ping
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Plus className="w-4 h-4" />
                  Nova Checagem
                </button>
              </div>
            </div>

            {/* Checks Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-slate-950/50">
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Nome & Tags</th>
                      <th className="py-4 px-6">Agendamento / Tolerância</th>
                      <th className="py-4 px-6">Último Ping</th>
                      <th className="py-4 px-6">URL de Ping</th>
                      <th className="py-4 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-sm">
                    {checks.map(check => {
                      const statusColor = 
                        check.status === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        check.status === 'down' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        check.status === 'grace' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/30';
                      
                      const statusDot = 
                        check.status === 'up' ? 'bg-emerald-500' :
                        check.status === 'down' ? 'bg-rose-500 animate-ping' :
                        check.status === 'grace' ? 'bg-amber-500' : 'bg-blue-500';

                      const statusLabel =
                        check.status === 'up' ? 'ATIVO' :
                        check.status === 'down' ? 'INATIVO' :
                        check.status === 'grace' ? 'TOLERÂNCIA' : 'NOVO';

                      return (
                        <tr key={check.id} className="hover:bg-slate-800/40 transition group">
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                              <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button 
                              onClick={() => setSelectedCheck(check)}
                              className="font-semibold text-white hover:text-emerald-400 text-left transition block"
                            >
                              {check.name}
                            </button>
                            <div className="flex items-center gap-1.5 mt-1">
                              {check.tags.map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {check.schedule}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">Tolerância: {check.grace}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-300 text-xs">
                            {check.lastPing ?? 'Nunca'}
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-slate-400">
                            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 max-w-xs truncate">
                              <span className="truncate">{check.pingUrl}</span>
                              <button
                                onClick={() => handleCopy(check.pingUrl, check.id)}
                                className="text-slate-400 hover:text-white transition p-1"
                                title="Copiar URL de Ping"
                              >
                                {copiedId === check.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedCheck(check)}
                                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                                title="Ver Detalhes"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCheck(check.id)}
                                className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                title="Excluir Checagem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Software Archaeology / Coursework Docs Tab */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Docs Navigation */}
            <div className="lg:col-span-1 space-y-2">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Documentação ao Vivo</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Sincronizado com os arquivos Markdown" />
                </div>
                <nav className="space-y-1">
                  {[
                    { id: 'readme', label: 'README.md', icon: FileText, desc: 'Visão geral & equipe' },
                    { id: 'discovery', label: '01-discovery/', icon: BookOpen, desc: 'JTBD, Personas, Escopo' },
                    { id: 'processo', label: '02-processo/', icon: GitBranch, desc: 'Commits, Issues, PRs' },
                    { id: 'requisitos', label: '03-requisitos/', icon: Shield, desc: 'RF, RNF, Histórias' },
                    { id: 'uml', label: '04-uml/', icon: Cpu, desc: 'Diagramas UML & Arquitetura' },
                    { id: 'evolucao', label: '05-evolucao/', icon: RefreshCw, desc: 'Problema, MVP & Impacto' },
                    { id: 'implementacao', label: '06-implementacao/', icon: Terminal, desc: 'Código, testes & PR' },
                    { id: 'etica', label: '07-etica/', icon: AlertTriangle, desc: 'Considerações éticas' },
                    { id: 'ia', label: '08-ia (ia.md)', icon: Cpu, desc: 'Uso de Inteligência Artificial' },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = archaeologySubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setArchaeologySubTab(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-start gap-3 ${
                          isActive 
                            ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 font-medium' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className="text-[11px] text-slate-500">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Autoras do Trabalho</h4>
                <p className="text-xs text-slate-300 font-medium">Sofia Lacorti Oliveira</p>
                <p className="text-xs text-slate-300 font-medium">Maria Clara Rezende Dias</p>
                <p className="text-[11px] text-slate-500 mt-2">CSI412 - Engenharia de Software I<br/>UFOP, 2026/2</p>
              </div>
            </div>

            {/* Document Viewer Content (Dynamically fetched from Markdown files) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold uppercase">
                    Arquivo: {DOC_PATHS[archaeologySubTab]}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-3 capitalize">Visualizador Dinâmico de Arqueologia</h2>
                </div>
                <button
                  onClick={() => {
                    const path = DOC_PATHS[archaeologySubTab];
                    fetch(path)
                      .then(res => res.text())
                      .then(text => setDocContent(text));
                    showToast('Documentação recarregada com sucesso!');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              </div>

              {docLoading ? (
                <div className="py-20 text-center text-slate-400 animate-pulse">Carregando arquivo Markdown...</div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {docContent}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Check Details Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedCheck.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    selectedCheck.status === 'up' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    selectedCheck.status === 'down' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {selectedCheck.status === 'up' ? 'ATIVO' : selectedCheck.status === 'down' ? 'INATIVO' : 'TOLERÂNCIA'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Agendamento: {selectedCheck.schedule} • Tolerância: {selectedCheck.grace}</p>
              </div>
              <button 
                onClick={() => setSelectedCheck(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">URL do Endpoint de Ping</label>
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <span className="flex-1 truncate">{selectedCheck.pingUrl}</span>
                  <button
                    onClick={() => handleCopy(selectedCheck.pingUrl, 'modal_' + selectedCheck.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    {copiedId === 'modal_' + selectedCheck.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copiar URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Envie uma requisição GET ou POST para esta URL para registrar um ping bem-sucedido.</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Pings Recentes & Logs ({selectedCheck.pingsCount} total)</h4>
                {selectedCheck.logs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-950 p-4 rounded-xl text-center border border-slate-800">Nenhum ping registrado ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedCheck.logs.map(log => (
                      <div key={log.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.type === 'success' ? 'bg-emerald-500' :
                            log.type === 'start' ? 'bg-blue-500' : 'bg-rose-500'
                          }`} />
                          <span className="font-medium text-white capitalize">{log.type === 'success' ? 'Sucesso' : log.type === 'start' ? 'Início' : 'Falha'}</span>
                          <span className="text-slate-500">• {log.timestamp}</span>
                        </div>
                        <span className="text-slate-400 font-mono">{log.durationMs}ms</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCheck(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-sm font-medium transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Check Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateCheck} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Criar Nova Checagem Cron</h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Nome da Checagem</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sincronização Diária de Usuários"
                  value={newCheckName}
                  onChange={e => setNewCheckName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Agendamento</label>
                <input
                  type="text"
                  required
                  value={newCheckSchedule}
                  onChange={e => setNewCheckSchedule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={newCheckTags}
                  onChange={e => setNewCheckTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/30"
              >
                Criar Checagem
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulate Ping Modal */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSimulatePing} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Simular Ping Cron</h3>
              <button 
                type="button" 
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Checagem Alvo</label>
                <select
                  value={simulationTargetId}
                  onChange={e => setSimulationTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  {checks.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Tipo de Resultado do Ping</label>
                <select
                  value={simulationType}
                  onChange={e => setSimulationType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="success">Sucesso (/ping - Saudável)</option>
                  <option value="start">Início (/ping/start - Tarefa Iniciada)</option>
                  <option value="fail">Falha (/ping/fail - Tarefa Falhou)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSimulateModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-900/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Ping
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>CSI412 Arqueologia de Software • Plataforma Healthchecks • Sincronizado com os arquivos Markdown locais</p>
      </footer>
    </div>
  );
}
