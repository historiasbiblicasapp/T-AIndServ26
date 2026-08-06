import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface ReportChartProps {
  title: string
  type: 'bar' | 'line' | 'pie'
  data: { name: string; value: number }[]
  xKey?: string
  yKey?: string
  colors?: string[]
}

export default function ReportChart({ title, type, data, xKey = 'name', yKey = 'value', colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }: ReportChartProps) {
  const ChartComponent = type === 'pie' ? PieChart : type === 'line' ? LineChart : BarChart

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {type === 'pie' ? (
              <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label>
                {data.map((_entry, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            ) : type === 'line' ? (
              <Line type="monotone" dataKey={yKey} stroke={colors[0]} strokeWidth={2} />
            ) : (
              <Bar dataKey={yKey} fill={colors[0]} />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
