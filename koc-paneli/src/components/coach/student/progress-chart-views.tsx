'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

export type ChartDataPoint = {
  date: string
  label: string
  weight: number | null
  waist: number | null
  bench: number | null
  squat: number | null
  deadlift: number | null
  sleep: number | null
  steps: number | null
  diet: number | null
  energy: number | null
}

const tooltipContentStyle = {
  backgroundColor: 'var(--background)',
  borderColor: 'var(--border)',
  borderRadius: '12px',
}
const tooltipLabelStyle = { color: 'var(--foreground)', fontWeight: 'bold' as const, fontSize: '12px' }
const tooltipItemStyle = { fontSize: '12px' }

export function BodyAreaChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
        </linearGradient>
        <linearGradient id="colorWaist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--ring)" stopOpacity={0.2} />
          <stop offset="95%" stopColor="var(--ring)" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
      <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
      <YAxis
        yAxisId="left"
        domain={['auto', 'auto']}
        tick={{ fill: 'var(--primary)', fontSize: 10 }}
        tickLine={false}
        axisLine={false}
        unit=" kg"
      />
      <YAxis
        yAxisId="right"
        orientation="right"
        domain={['auto', 'auto']}
        tick={{ fill: 'var(--ring)', fontSize: 10 }}
        tickLine={false}
        axisLine={false}
        unit=" cm"
      />
      <Tooltip
        contentStyle={tooltipContentStyle}
        labelStyle={tooltipLabelStyle}
        itemStyle={tooltipItemStyle}
      />
      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
      <Area
        yAxisId="left"
        type="monotone"
        dataKey="weight"
        name="Kilo"
        stroke="var(--primary)"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorWeight)"
        dot={{ r: 3 }}
        connectNulls
      />
      <Area
        yAxisId="right"
        type="monotone"
        dataKey="waist"
        name="Bel Çevresi"
        stroke="var(--ring)"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorWaist)"
        dot={{ r: 3 }}
        connectNulls
      />
    </AreaChart>
  )
}

export function LiftsLineChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
      <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} unit=" kg" />
      <Tooltip
        contentStyle={tooltipContentStyle}
        labelStyle={tooltipLabelStyle}
        itemStyle={tooltipItemStyle}
      />
      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
      <Line
        type="monotone"
        dataKey="bench"
        name="Bench Press"
        stroke="var(--destructive)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
      <Line
        type="monotone"
        dataKey="squat"
        name="Squat"
        stroke="var(--primary)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
      <Line
        type="monotone"
        dataKey="deadlift"
        name="Deadlift"
        stroke="var(--ring)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
    </LineChart>
  )
}

export function LifestyleLineChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
      <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 10]} />
      <Tooltip
        contentStyle={tooltipContentStyle}
        labelStyle={tooltipLabelStyle}
        itemStyle={tooltipItemStyle}
      />
      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
      <Line
        type="monotone"
        dataKey="sleep"
        name="Uyku (saat)"
        stroke="var(--secondary)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
      <Line
        type="monotone"
        dataKey="diet"
        name="Diyet Skoru"
        stroke="var(--primary)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
      <Line
        type="monotone"
        dataKey="energy"
        name="Enerji Seviyesi"
        stroke="var(--ring)"
        strokeWidth={2}
        dot={{ r: 3 }}
        connectNulls
      />
    </LineChart>
  )
}

export function StepsAreaChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
      <defs>
        <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,201,172,0.06)" />
      <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
      <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
      <Tooltip
        contentStyle={tooltipContentStyle}
        labelStyle={tooltipLabelStyle}
        itemStyle={tooltipItemStyle}
        formatter={(value) => [`${Math.round(Number(value)).toLocaleString('tr-TR')} adım`, 'Adım Sayısı']}
      />
      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
      <Area
        type="monotone"
        dataKey="steps"
        name="Günlük Ortalama Adım"
        stroke="var(--primary)"
        strokeWidth={2}
        fillOpacity={1}
        fill="url(#colorSteps)"
        dot={{ r: 3 }}
        connectNulls
      />
    </AreaChart>
  )
}
