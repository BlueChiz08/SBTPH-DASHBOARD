import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from 'react';

// Color constants based on theme
const COLORS = {
  primary: 'hsl(178, 52%, 37%)',
  success: 'hsl(185, 59%, 49%)',
  warning: 'hsl(20, 76%, 60%)',
  destructive: 'hsl(358, 85%, 62%)',
  muted: 'hsl(215, 16%, 47%)',
  background: 'hsl(210, 20%, 98%)',
};

const PIE_COLORS = [COLORS.success, COLORS.primary, COLORS.warning];

interface ChartProps {
  data: any[];
}

export function TargetVsShipOkChart({ data }: ChartProps) {
  const aggregatedData = useMemo(() => {
    const monthlyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          date: item.date,
          target: 0,
          newDepositShipOk: 0,
        });
      }
      
      const entry = monthlyMap.get(monthKey);
      entry.target += Number(item.target || 0);
      entry.newDepositShipOk += Number(item.newDepositShipOk || 0);
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
        <CardDescription>Target vs Ship OK achievement over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={aggregatedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Bar 
              dataKey="target" 
              name="Target" 
              fill={COLORS.muted} 
              barSize={20} 
              radius={[4, 4, 0, 0]} 
              fillOpacity={0.3}
            />
            <Bar 
              dataKey="newDepositShipOk" 
              name="Ship OK" 
              fill={COLORS.primary} 
              barSize={20} 
              radius={[4, 4, 0, 0]} 
            />
            <Line 
              type="monotone" 
              dataKey="newDepositShipOk" 
              name="Trend" 
              stroke={COLORS.success} 
              strokeWidth={3} 
              dot={{ r: 4, fill: COLORS.success, strokeWidth: 2, stroke: '#fff' }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BreakdownChart({ data }: ChartProps) {
  const breakdownData = useMemo(() => {
    // Sum up totals for the breakdown
    const totals = data.reduce((acc, curr) => ({
      newDeposit: acc.newDeposit + Number(curr.newDepositShipOk || 0),
      strategic: acc.strategic + Number(curr.strategic || 0),
      retention: acc.retention + Number(curr.retention || 0),
    }), { newDeposit: 0, strategic: 0, retention: 0 });

    const totalValue = totals.newDeposit + totals.strategic + totals.retention;
    
    return [
      { name: 'New Deposit', value: totals.newDeposit, percent: totalValue > 0 ? (totals.newDeposit / totalValue * 100).toFixed(1) : 0 },
      { name: 'Strategic', value: totals.strategic, percent: totalValue > 0 ? (totals.strategic / totalValue * 100).toFixed(1) : 0 },
      { name: 'Retention', value: totals.retention, percent: totalValue > 0 ? (totals.retention / totalValue * 100).toFixed(1) : 0 },
    ].filter(item => item.value > 0);
  }, [data]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if ((percent * 100) < 5) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="col-span-1 shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Ship OK Breakdown</CardTitle>
        <CardDescription>Distribution by category</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, payload }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                if (payload.percent < 5) return null;

                return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
                    {`${payload.percent}%`}
                  </text>
                );
              }}
            >
              {breakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.percent}%)`, name]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TrendLineChart({ data }: ChartProps) {
  const aggregatedTrendData = useMemo(() => {
    const monthlyMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          date: item.date,
          target: 0,
          newDepositShipOk: 0,
        });
      }
      
      const entry = monthlyMap.get(monthKey);
      entry.target += Number(item.target || 0);
      entry.newDepositShipOk += Number(item.newDepositShipOk || 0);
    });
    
    return Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        progress: item.target > 0 ? (Number(item.newDepositShipOk) / Number(item.target)) * 100 : 0
      }));
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Progress Trend (6 Months)</CardTitle>
        <CardDescription>Achievement percentage over time</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={aggregatedTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              unit="%" 
              axisLine={false}
              tickLine={false}
              dx={-10}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progress']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="progress" 
              stroke={COLORS.primary} 
              fillOpacity={1} 
              fill="url(#colorProgress)" 
              strokeWidth={3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
