import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Code2, LayoutDashboard, History as HistoryIcon,
  ChevronDown, Sparkles, Bug, Zap, Shield, BookOpen
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import API from '../utils/axios';
import History from './History';

const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java',
  'C++', 'C', 'Go', 'Rust', 'PHP', 'Ruby'
];

const LANG_MAP = {
  'JavaScript': 'javascript', 'TypeScript': 'typescript',
  'Python': 'python', 'Java': 'java', 'C++': 'cpp',
  'C': 'c', 'Go': 'go', 'Rust': 'rust',
  'PHP': 'php', 'Ruby': 'ruby'
};

const SEVERITY_COLORS = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-blue-400',
  info: 'text-gray-400',
};

const SEVERITY_BADGE = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};

const CATEGORY_ICONS = {
  bestPractices: { icon: Code2,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Best Practices' },
  bugs:          { icon: Bug,    color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Bugs' },
  performance:   { icon: Zap,    color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Performance' },
  security:      { icon: Shield, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Security' },
};

function ScoreRing({ score }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#2A2A2A" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#10B981" strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" />
      <text x="70" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="700">{score}</text>
      <text x="70" y="82" textAnchor="middle" fill="#6B7280" fontSize="11">Score</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [customStandards, setCustomStandards] = useState('');
  const [focus, setFocus] = useState({
    bestPractices: true, bugs: true, performance: true, security: true
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [fixLoading, setFixLoading] = useState(null);
  const [fixedCode, setFixedCode] = useState(null);
  const [fixModalIssue, setFixModalIssue] = useState(null);
  console.log('fixedCode:', fixedCode);
console.log('fixModalIssue:', fixModalIssue);

  const handleLogout = () => { logout(); navigate('/auth'); };

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setFixedCode(null);
    setFixModalIssue(null);
    try {
      const { data } = await API.post('/review', { code, language, focus, customStandards });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async (issue, index) => {
    setFixLoading(index);
    setFixedCode(null);
    setFixModalIssue(issue);
    try {
      const { data } = await API.post('/review/fix', { code, issue });
      console.log('Fix response:', data); // add this
      setFixedCode(data.fixedCode);
    } catch (err) {
      console.error(err);
    } finally {
      setFixLoading(null);
    }
  };

  const toggleFocus = (key) => setFocus(f => ({ ...f, [key]: !f[key] }));

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside className="w-56 bg-[#1A1A1A] border-r border-[#2A2A2A] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2A2A2A]">
          <div className="w-9 h-9 bg-[#10B981] rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-base">
            CodeReview <span className="text-[#10B981]">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'history',   label: 'History',   icon: HistoryIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${activePage === id ? 'bg-[#10B981] text-black' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[#2A2A2A]">
          <p className="text-gray-400 text-xs mb-1">Signed in as</p>
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white text-xs mt-2 transition">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {activePage === 'history' ? (
          <History />
        ) : (
          <>
            {/* Left panel */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-start justify-between px-8 py-6 border-b border-[#2A2A2A]">
                <div>
                  <h1 className="text-white text-2xl font-bold">Code Review Dashboard</h1>
                  <p className="text-gray-400 text-sm mt-1">Paste your code and get instant AI-powered feedback</p>
                </div>
                <button onClick={handleReview} disabled={loading}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition">
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Reviewing...' : 'Review Code'}
                </button>
              </div>

              <div className="px-8 py-6 space-y-5">

                {/* Language */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Language</label>
                  <div className="relative w-full">
                    <button onClick={() => setShowLangDropdown(!showLangDropdown)}
                      className="w-full flex items-center justify-between bg-[#1E1E1E] border border-[#2A2A2A] text-white text-sm px-4 py-3 rounded-lg hover:border-[#10B981] transition">
                      <span>{language}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    {showLangDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg overflow-hidden z-10">
                        {LANGUAGES.map(lang => (
                          <button key={lang}
                            onClick={() => { setLanguage(lang); setShowLangDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition
                              ${language === lang ? 'bg-[#10B981] text-black font-medium' : 'text-gray-300 hover:bg-[#2A2A2A]'}`}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Focus */}
                <div>
                  <label className="text-gray-300 text-sm mb-3 block">Review Focus</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'bestPractices', label: 'Best Practices', icon: BookOpen },
                      { key: 'bugs',          label: 'Bugs',           icon: Bug },
                      { key: 'performance',   label: 'Performance',    icon: Zap },
                      { key: 'security',      label: 'Security',       icon: Shield },
                    ].map(({ key, label, icon: Icon }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <div onClick={() => toggleFocus(key)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition flex-shrink-0
                            ${focus[key] ? 'bg-[#10B981] border-[#10B981]' : 'border-[#3A3A3A] bg-transparent'}`}>
                          {focus[key] && (
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Standards */}
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Custom Standards (Optional)</label>
                  <textarea value={customStandards} onChange={(e) => setCustomStandards(e.target.value)}
                    placeholder="Paste your coding standards document here..." rows={3}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-white placeholder-gray-600 text-sm px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-[#10B981] transition" />
                </div>

                {/* Monaco Editor */}
                <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
                  <div className="flex items-center justify-between bg-[#1E1E1E] px-4 py-2.5 border-b border-[#2A2A2A]">
                    <span className="text-gray-400 text-xs">editor</span>
                    <span className="text-gray-500 text-xs">{LANG_MAP[language]}</span>
                  </div>
                  <Editor height="340px" language={LANG_MAP[language]} value={code}
                    onChange={(val) => setCode(val || '')} theme="vs-dark"
                    options={{ fontSize: 13, minimap: { enabled: true }, scrollBeyondLastLine: false, padding: { top: 12 }, fontFamily: 'JetBrains Mono, Fira Code, monospace' }} />
                </div>

              </div>
            </div>

            {/* Right panel */}
            <div className="w-80 bg-[#1A1A1A] border-l border-[#2A2A2A] flex-shrink-0 p-4 space-y-4 overflow-y-auto h-screen sticky top-0">
              {/* Fix result — FIRST so it's visible immediately */}
  {fixedCode && fixModalIssue && (
    <div className="bg-[#222] border border-[#10B981]/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm font-semibold">Fixed Code</p>
        <button onClick={() => { setFixedCode(null); setFixModalIssue(null); }}
          className="text-gray-500 hover:text-white text-xs transition">
          ✕ Close
        </button>
      </div>
      <p className="text-gray-400 text-xs">{fixModalIssue.description}</p>
      <pre className="bg-[#0F0F0F] rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
        {fixedCode}
      </pre>
      <button
        onClick={() => {
          setCode(fixedCode);
          setFixedCode(null);
          setFixModalIssue(null);
          // remove only the fixed issue, keep the rest
          setResult(prev => ({
            ...prev,
            issues: prev.issues.filter(i => i !== fixModalIssue)
          }));
        }}
        className="w-full bg-[#10B981] hover:bg-[#059669] text-black text-xs font-semibold py-2 rounded-lg transition">
        Apply fix to editor
      </button>
    </div>
  )}

              {/* Score card */}
              <div className="bg-[#222] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold mb-3">Code Quality Score</p>
                    <div className="flex items-end gap-3">
                      {['critical', 'high', 'medium', 'low', 'info'].map((s) => (
                        <div key={s} className="text-center">
                          <p className={`text-lg font-bold ${SEVERITY_COLORS[s]}`}>
                            {result ? result.counts[s] : 0}
                          </p>
                          <p className="text-gray-500 text-[10px] capitalize">{s.slice(0, 4)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ScoreRing score={result ? result.score : 0} />
                </div>
              </div>

              {/* Category cards */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, color, bg, label }]) => (
                  <div key={key} className="bg-[#222] border border-[#2A2A2A] rounded-xl p-3">
                    <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white text-xl font-bold">{result ? result.categories[key] : 0}</p>
                  </div>
                ))}
              </div>

              {/* Custom Standards Match */}
              <div className="bg-[#222] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full border-2 border-[#10B981] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold text-sm">Custom Standards Match</p>
                </div>
                <p className="text-gray-400 text-xs mb-3">How well your code matches your uploaded standards</p>
                <p className="text-[#10B981] text-3xl font-bold mb-2">
                  {result ? `${result.customMatch}%` : '—'}
                </p>
                <div className="w-full bg-[#2A2A2A] rounded-full h-2">
                  <div className="bg-[#10B981] h-2 rounded-full transition-all duration-700"
                    style={{ width: result ? `${result.customMatch}%` : '0%' }} />
                </div>
              </div>

              {/* Issues list */}
              {result && result.issues && result.issues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-xs px-1">{result.issues.length} issues found</p>
                  {result.issues.map((issue, i) => (
                    <div key={i} className="bg-[#222] border border-[#2A2A2A] rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_BADGE[issue.severity] || ''}`}>
                          {issue.severity}
                        </span>
                        <span className="text-gray-500 text-xs ml-auto">Line {issue.line}</span>
                      </div>
                      <p className="text-white text-xs">{issue.description}</p>
                      <p className="text-[#10B981] text-xs">Fix: {issue.suggestion}</p>
                      <button onClick={() => handleFix(issue, i)} disabled={fixLoading === i}
                        className="w-full flex items-center justify-center gap-2 bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-xs py-1.5 rounded-lg transition disabled:opacity-50">
                        <Sparkles className="w-3 h-3" />
                        {fixLoading === i ? 'Fixing...' : 'Fix it for me'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Fix result
              {fixedCode && fixModalIssue && (
                <div className="bg-[#222] border border-[#10B981]/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-semibold">Fixed Code</p>
                    <button onClick={() => { setFixedCode(null); setFixModalIssue(null); }}
                      className="text-gray-500 hover:text-white text-xs transition">
                      ✕ Close
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs">{fixModalIssue.description}</p>
                  <pre className="bg-[#0F0F0F] rounded-lg p-3 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                    {fixedCode}
                  </pre>
                  <button
                    onClick={() => { setCode(fixedCode); setFixedCode(null); setFixModalIssue(null); }}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-black text-xs font-semibold py-2 rounded-lg transition">
                    Apply fix to editor
                  </button>
                </div>
              )} */}

              {/* Better Suggestions */}
              <div className="bg-[#222] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <p className="text-white font-semibold text-sm">Better Suggestions</p>
                </div>
                <p className="text-gray-500 text-xs">
                  {result ? 'Review complete — see issues above.' : 'Run a review to get AI suggestions.'}
                </p>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
