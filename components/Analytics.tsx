import React from 'react';
import { InventoryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface AnalyticsProps {
  items: InventoryItem[];
}

// Linear-esque Palette
const COLORS = ['#5E6AD2', '#3FA176', '#D4A018', '#D54B53', '#8850D4', '#42444A'];

const Analytics: React.FC<AnalyticsProps> = ({ items }) => {
  const totalBikes = items.reduce((acc, item) => acc + item.detections.length, 0);
  
  const colorMap: Record<string, number> = {};
  const comboMap: Record<string, number> = {};
  const categoryMap: Record<string, number> = {};

  items.forEach(item => {
    item.detections.forEach(d => {
        const color = d.frameColor || 'Unknown';
        colorMap[color] = (colorMap[color] || 0) + 1;

        // Create a readable combination key
        const combo = `${d.frameColor} + ${d.fenderColor === 'Unknown' ? 'No' : d.fenderColor} Fender`;
        comboMap[combo] = (comboMap[combo] || 0) + 1;

        const cat = d.category || 'Unknown';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
  });

  const comboData = Object.entries(comboMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)
    .slice(0, 10); // Top 10 combinations

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#191A1D] border border-border px-3 py-2 rounded shadow-2xl text-xs">
          <p className="text-textMain font-medium mb-1">{label || payload[0].name}</p>
          <div className="flex items-center gap-2 text-textMuted">
            <div className="w-2 h-2 rounded-full" style={{background: payload[0].fill || '#5E6AD2'}}></div>
            <span>{payload[0].value} units</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full bg-background">
        <div className="flex flex-col gap-1">
             <h2 className="text-lg font-medium text-textMain">Overview</h2>
             <p className="text-sm text-textMuted">Real-time breakdown of parking inventory.</p>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-border p-5 rounded-lg hover:border-border/80 transition-colors group">
                <h3 className="text-textMuted text-[11px] uppercase tracking-wider font-semibold mb-1">Total Inventory</h3>
                <p className="text-3xl font-medium text-textMain group-hover:text-primary transition-colors">{totalBikes}</p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-lg">
                <h3 className="text-textMuted text-[11px] uppercase tracking-wider font-semibold mb-1">Top Configuration</h3>
                <p className="text-xl font-medium text-textMain truncate mt-1.5">
                    {comboData.length > 0 ? comboData[0].name : 'N/A'}
                </p>
            </div>
            <div className="bg-surface border border-border p-5 rounded-lg">
                <h3 className="text-textMuted text-[11px] uppercase tracking-wider font-semibold mb-1">Scan Success Rate</h3>
                <p className="text-3xl font-medium text-textMain">
                    {items.length > 0 ? Math.round((items.filter(i => i.status !== 'ERROR').length / items.length) * 100) : 0}%
                </p>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Combo Bar Chart */}
            <div className="bg-surface border border-border p-6 rounded-lg flex flex-col">
                <h3 className="text-sm font-medium text-textMain mb-6">Detailed Breakdown (Frame + Fender)</h3>
                <div className="flex-1 h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comboData} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={140} 
                                tick={{fill: '#8A8F98', fontSize: 11, fontWeight: 500}} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{fill: '#27272a', opacity: 0.4}} content={<CustomTooltip />} />
                            <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                {comboData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Pie Chart */}
             <div className="bg-surface border border-border p-6 rounded-lg flex flex-col">
                <h3 className="text-sm font-medium text-textMain mb-6">Category Distribution</h3>
                <div className="flex-1 h-[300px] relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                     </ResponsiveContainer>
                     {/* Center Label */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-semibold text-textMain">{totalBikes}</span>
                        <span className="text-xs text-textMuted uppercase tracking-wider">Bikes</span>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;