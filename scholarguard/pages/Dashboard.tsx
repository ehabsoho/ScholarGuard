import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const dataPlagiarism = [
  { name: 'Original', value: 85 },
  { name: 'Plagiarized', value: 15 },
];

const dataAI = [
  { name: 'Human', value: 62 },
  { name: 'AI Generated', value: 38 },
];

const activityData = [
  { name: 'Mon', files: 4 },
  { name: 'Tue', files: 7 },
  { name: 'Wed', files: 3 },
  { name: 'Thu', files: 12 },
  { name: 'Fri', files: 9 },
];

const COLORS = ['#0f172a', '#d4af37']; // Scholar Blue, Gold

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-scholar-900 mb-2">Welcome back, Professor.</h2>
        <p className="text-scholar-gray">Here is an overview of your recent scientific integrity checks.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Files Scanned', value: '1,284', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Similarity', value: '12%', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Pass Rate', value: '94%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'AI Detection Rate', value: '38%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-scholar-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Plagiarism Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-serif font-semibold text-scholar-900 mb-6">Average Plagiarism Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPlagiarism}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPlagiarism.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-scholar-900"></span>
              <span>Original Content</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-scholar-gold"></span>
              <span>Matched Sources</span>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-serif font-semibold text-scholar-900 mb-6">Weekly Scan Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="files" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
