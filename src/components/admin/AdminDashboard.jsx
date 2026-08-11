import React, { useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { calculateMetrics } from '../../lib/slaEngine';
import { STATES, CATEGORY_LABELS, CATEGORIES } from '../../lib/stateMachine';
import StatusBadge from '../common/StatusBadge';
import SLATimer from '../common/SLATimer';
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle,
  CheckCircle, ArrowUpRight, Users, Shield, MapPin,
  Filter, Download, ChevronRight, Activity, Target, Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { timeAgo, formatDateTime, getStatusColor } from '../../lib/utils';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#f97316', '#06b6d4'];

export default function AdminDashboard() {
  const { formatMessage } = useIntl();
  const { locale } = useLanguage();
  const { complaints, flyingSquads, districts } = useComplaints();
  const [activeTab, setActiveTab] = useState('overview');

  const metrics = useMemo(() => calculateMetrics(complaints), [complaints]);

  // Generate chart data
  const categoryData = useMemo(() => {
    const counts = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: CATEGORY_LABELS[locale]?.[key] || key,
      value,
      key,
    }));
  }, [complaints, locale]);

  const statusData = useMemo(() => {
    const counts = {};
    complaints.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: key.replace(/_/g, ' '),
      value,
      fill: getStatusColor(key),
    }));
  }, [complaints]);

  const districtData = useMemo(() => {
    return districts.map(d => {
      const distComplaints = complaints.filter(c => c.location?.district === d.id);
      const resolved = distComplaints.filter(c => c.timestamps?.actionTime);
      const withinSLA = resolved.filter(c => {
        const sub = new Date(c.timestamps.submissionTime);
        const act = new Date(c.timestamps.actionTime);
        return (act - sub) / (1000 * 60) <= 100;
      });
      return {
        name: locale === 'hi' ? d.nameHi : d.name,
        total: distComplaints.length,
        resolved: resolved.length,
        slaCompliance: distComplaints.length > 0 ? Math.round((withinSLA.length / distComplaints.length) * 100) : 100,
      };
    }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);
  }, [complaints, districts, locale]);

  // Simulate hourly volume trend
  const volumeTrend = useMemo(() => {
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      const t = new Date(Date.now() - i * 3600 * 1000);
      const hr = t.getHours();
      const label = `${hr.toString().padStart(2, '0')}:00`;
      hours.push({
        time: label,
        complaints: Math.floor(Math.random() * 8) + (hr >= 7 && hr <= 18 ? 5 : 1),
        resolved: Math.floor(Math.random() * 5) + (hr >= 7 && hr <= 18 ? 3 : 0),
      });
    }
    return hours;
  }, []);

  const tabs = [
    { id: 'overview', label: locale === 'hi' ? 'अवलोकन' : 'Overview', icon: Activity },
    { id: 'complaints', label: locale === 'hi' ? 'शिकायतें' : 'Complaints', icon: AlertTriangle },
    { id: 'analytics', label: locale === 'hi' ? 'विश्लेषण' : 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">{formatMessage({ id: 'nav.dashboard' })}</h1>
        <p className="page-subtitle">{formatMessage({ id: 'app.tagline' })}</p>
      </div>

      {/* Tab Navigation */}
      <div className="filters-bar" style={{ marginBottom: 'var(--space-6)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`filter-chip ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {/* Metric Cards */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="metric-card" style={{ '--metric-color': 'var(--primary)', '--metric-color-bg': 'var(--primary-100)' }}>
              <div className="metric-card-icon"><Target size={22} /></div>
              <div className="metric-card-value">{metrics.slaComplianceRate}%</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.slaCompliance' })}</div>
              <div className={`metric-card-change ${metrics.slaComplianceRate >= 80 ? 'positive' : 'negative'}`}>
                {metrics.slaComplianceRate >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {metrics.slaComplianceRate >= 80 ? 'On Target' : 'Below Target'}
              </div>
            </div>

            <div className="metric-card" style={{ '--metric-color': 'var(--info)', '--metric-color-bg': 'var(--info-bg)' }}>
              <div className="metric-card-icon"><AlertTriangle size={22} /></div>
              <div className="metric-card-value">{metrics.activeCount}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.activeComplaints' })}</div>
              <div className="metric-card-change negative">
                <Zap size={12} /> {locale === 'hi' ? 'सक्रिय' : 'Active Now'}
              </div>
            </div>

            <div className="metric-card" style={{ '--metric-color': 'var(--success)', '--metric-color-bg': 'var(--success-bg)' }}>
              <div className="metric-card-icon"><CheckCircle size={22} /></div>
              <div className="metric-card-value">{metrics.resolvedCount}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.resolvedCount' })}</div>
              <div className="metric-card-change positive">
                <TrendingUp size={12} /> {Math.round((metrics.resolvedCount / Math.max(1, metrics.totalComplaints)) * 100)}%
              </div>
            </div>

            <div className="metric-card" style={{ '--metric-color': 'var(--danger)', '--metric-color-bg': 'var(--danger-bg)' }}>
              <div className="metric-card-icon"><Clock size={22} /></div>
              <div className="metric-card-value">{metrics.avgResolutionTime}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.avgResolutionTime' })} (min)</div>
              <div className={`metric-card-change ${metrics.avgResolutionTime <= 100 ? 'positive' : 'negative'}`}>
                {metrics.avgResolutionTime <= 100 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {metrics.avgResolutionTime <= 100 ? '< 100 min' : '> 100 min'}
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="metric-card" style={{ '--metric-color': 'var(--warning)', '--metric-color-bg': 'var(--warning-bg)' }}>
              <div className="metric-card-icon"><ArrowUpRight size={20} /></div>
              <div className="metric-card-value">{metrics.avgDispatchTime}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.avgDispatchTime' })} (min)</div>
            </div>
            <div className="metric-card" style={{ '--metric-color': '#8b5cf6', '--metric-color-bg': 'rgba(139, 92, 246, 0.1)' }}>
              <div className="metric-card-icon"><MapPin size={20} /></div>
              <div className="metric-card-value">{metrics.avgArrivalTime}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.avgArrivalTime' })} (min)</div>
            </div>
            <div className="metric-card" style={{ '--metric-color': '#ef4444', '--metric-color-bg': 'rgba(239, 68, 68, 0.1)' }}>
              <div className="metric-card-icon"><ArrowUpRight size={20} /></div>
              <div className="metric-card-value">{metrics.escalatedCount}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.escalatedCount' })}</div>
            </div>
          </div>

          {/* Volume Trend */}
          <div className="chart-container" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              {formatMessage({ id: 'admin.volumeTrend' })}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={volumeTrend}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Area type="monotone" dataKey="complaints" stroke="#6366f1" fill="url(#colorComplaints)" strokeWidth={2} name={locale === 'hi' ? 'शिकायतें' : 'Complaints'} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#colorResolved)" strokeWidth={2} name={locale === 'hi' ? 'समाधान' : 'Resolved'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Flying Squad Status */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Shield size={18} />
                {locale === 'hi' ? 'फ्लाइंग स्क्वाड स्थिति' : 'Flying Squad Status'}
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {flyingSquads.map(squad => (
                <div key={squad.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-5)',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: squad.status === 'available' ? 'var(--success)' : 'var(--warning)',
                      boxShadow: squad.status === 'available' ? '0 0 8px var(--success)' : '0 0 8px var(--warning)',
                    }} />
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{squad.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {squad.districtId && districts.find(d => d.id === squad.districtId)?.[locale === 'hi' ? 'nameHi' : 'name']}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: squad.status === 'available' ? 'var(--success)' : 'var(--warning)',
                    padding: '2px var(--space-2)',
                    borderRadius: 'var(--radius-full)',
                    background: squad.status === 'available' ? 'var(--success-bg)' : 'var(--warning-bg)',
                  }}>
                    {squad.status === 'available' ? (locale === 'hi' ? 'उपलब्ध' : 'Available') : (locale === 'hi' ? 'मिशन पर' : 'On Mission')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complaints Tab */}
      {activeTab === 'complaints' && <ComplaintListView />}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in">
          {/* Category Breakdown */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="chart-container">
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                {formatMessage({ id: 'admin.categoryBreakdown' })}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px' }}
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                {locale === 'hi' ? 'स्थिति वितरण' : 'Status Distribution'}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District Performance */}
          <div className="chart-container" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              {formatMessage({ id: 'admin.districtPerformance' })}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total" name={locale === 'hi' ? 'कुल' : 'Total'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name={locale === 'hi' ? 'समाधान' : 'Resolved'} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="slaCompliance" name="SLA %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Call Handling Metrics (Simulated) */}
          <div className="grid-3">
            <div className="metric-card" style={{ '--metric-color': 'var(--info)', '--metric-color-bg': 'var(--info-bg)' }}>
              <div className="metric-card-icon"><Clock size={20} /></div>
              <div className="metric-card-value">4.3</div>
              <div className="metric-card-label">{locale === 'hi' ? 'औसत कॉल समय (मिनट)' : 'Avg Call Time (min)'}</div>
            </div>
            <div className="metric-card" style={{ '--metric-color': 'var(--danger)', '--metric-color-bg': 'var(--danger-bg)' }}>
              <div className="metric-card-icon"><Users size={20} /></div>
              <div className="metric-card-value">3.2%</div>
              <div className="metric-card-label">{locale === 'hi' ? 'कॉल छोड़ने की दर' : 'Call Abandonment Rate'}</div>
            </div>
            <div className="metric-card" style={{ '--metric-color': 'var(--success)', '--metric-color-bg': 'var(--success-bg)' }}>
              <div className="metric-card-icon"><Activity size={20} /></div>
              <div className="metric-card-value">{metrics.totalComplaints}</div>
              <div className="metric-card-label">{formatMessage({ id: 'admin.totalComplaints' })}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Complaint List with Filters
function ComplaintListView() {
  const { locale } = useLanguage();
  const { complaints, districts } = useComplaints();
  const [statusFilter, setStatusFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = [...complaints];
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    if (districtFilter !== 'all') result = result.filter(c => c.location?.district === districtFilter);
    if (searchQuery) result = result.filter(c => 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return result.sort((a, b) => new Date(b.timestamps.submissionTime) - new Date(a.timestamps.submissionTime));
  }, [complaints, statusFilter, districtFilter, searchQuery]);

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'hi' ? 'आईडी या विवरण खोजें...' : 'Search by ID or description...'}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">{locale === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
          {Object.values(STATES).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select className="form-select" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">{locale === 'hi' ? 'सभी जिले' : 'All Districts'}</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{locale === 'hi' ? d.nameHi : d.name}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
        {filtered.length} {locale === 'hi' ? 'शिकायतें' : 'complaints'}
      </div>

      {/* Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{locale === 'hi' ? 'श्रेणी' : 'Category'}</th>
              <th>{locale === 'hi' ? 'जिला' : 'District'}</th>
              <th>{locale === 'hi' ? 'स्थिति' : 'Status'}</th>
              <th>SLA</th>
              <th>{locale === 'hi' ? 'समय' : 'Time'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{c.id}</td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{CATEGORY_LABELS[locale]?.[c.category]}</td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{locale === 'hi' ? c.location?.districtNameHi : c.location?.districtName}</td>
                <td><StatusBadge status={c.status} /></td>
                <td><SLATimer complaint={c} compact /></td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{timeAgo(c.timestamps?.submissionTime, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
