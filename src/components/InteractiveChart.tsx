import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartProps {
  data: {
    title: string;
    data: {name: string, value: number}[];
  }
}

export const InteractiveChart: React.FC<ChartProps> = ({ data }) => {
  if (!data || !data.data) return <div>Invalid Chart Data</div>;

  return (
    <div className="my-6 rounded-2xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden font-sans">
      <div className="bg-[#fcfcfc] px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
        <div className="flex items-center gap-2">
           <BarChart3 className="w-5 h-5 text-orange-500" />
           <span className="font-semibold tracking-tight text-[15px] text-[#1a1a1a]">Data Visualization</span>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="text-[17px] font-semibold text-[#1a1a1a] mb-6 text-center">{data.title}</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
