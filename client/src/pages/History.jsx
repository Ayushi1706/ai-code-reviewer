import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Code2, Calendar } from 'lucide-react';
import API from '../utils/axios';

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreBadge = (score) => {
  if (score >= 80) return { label: 'Excellent', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' };
  if (score >= 60) return { label: 'Good',      cls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' };
  if (score >= 40) return { label: 'Fair',      cls: 'bg-orange-500/10 text-orange-400 border border-orange-500/30' };
  return             { label: 'Poor',      cls: 'bg-red-500/10 text-red-400 border border-red-500/30' };
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get('/review/history');
console.log('History data:', data);
setReviews(data.reviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const avgScore = reviews.length
    ? Math.round(reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length)
    : 0;

  const totalCritical = reviews.reduce((sum, r) => sum + (r.counts?.critical || 0), 0);
  
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#2A2A2A]">
        <h1 className="text-white text-2xl font-bold">Review History</h1>
        <p className="text-gray-400 text-sm mt-1">View all your past code reviews and their results</p>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Score</p>
              <p className="text-white text-2xl font-bold">{avgScore}</p>
            </div>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Reviews</p>
              <p className="text-white text-2xl font-bold">{reviews.length}</p>
            </div>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Code2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Critical Issues</p>
              <p className="text-white text-2xl font-bold">{totalCritical}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Language</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Score</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Issues</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Loading history...</p>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="p-4 bg-[#2A2A2A] rounded-full w-fit mx-auto mb-3">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400">No reviews yet</p>
                    <p className="text-gray-500 text-sm mt-1">Start reviewing code to see your history</p>
                  </td>
                </tr>
              ) : (
                reviews.map((item) => {
                  const badge = getScoreBadge(item.score);
                  const totalIssues = item.counts
                    ? Object.values(item.counts).reduce((a, b) => a + b, 0)
                    : 0;
                  return (
                    <tr
                      key={item._id}
                      className="border-b border-[#2A2A2A] hover:bg-[#2A2A2A]/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{formatDate(item.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 bg-[#2A2A2A] text-gray-300 rounded-md">
                          {item.language}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                          {item.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{totalIssues} issues</span>
                          {item.counts?.critical > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              {item.counts.critical} critical
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}