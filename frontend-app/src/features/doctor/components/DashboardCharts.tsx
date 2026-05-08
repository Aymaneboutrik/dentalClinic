import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import { doctorDashboardConfig } from "../config/dashboard.config";

import { useTranslation } from "react-i18next";

interface DashboardChartsProps {
  weeklyData: any[];
  statusData: any[];
}

export function DashboardCharts({ weeklyData, statusData }: DashboardChartsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Activity Chart */}
      <Card className="col-span-2 glass shadow-glass">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.weeklyActivity")}</CardTitle>
          <CardDescription>
            {t("dashboard.charts.weeklyActivityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {weeklyData.every((d) => d.appointments === 0) ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="h-1 bg-muted/20 w-full max-w-[200px] rounded-full overflow-hidden">
                   <div className="h-full bg-primary/20 w-1/3 animate-pulse" />
                </div>
                <p className="text-xs italic">{t("dashboard.charts.noActivity")}</p>
              </div>
            ) : (
              <ChartContainer
                config={{
                  appointments: {
                    label: t("dashboard.charts.appointments"),
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-full w-full"
              >
                <AreaChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorApp)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Status Pie Chart */}
      <Card className="glass shadow-glass">
        <CardHeader>
          <CardTitle>{t("dashboard.charts.statusDistribution")}</CardTitle>
          <CardDescription>{t("dashboard.charts.statusDistributionDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex flex-col">
            {statusData.every((d) => d.value === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <div className="h-20 w-20 rounded-full border-4 border-muted/20 flex items-center justify-center">
                  <span className="text-xs">0%</span>
                </div>
                <p className="text-xs italic">{t("dashboard.charts.noData")}</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 w-full relative">
                <ChartContainer
                  config={{
                    value: {
                      label: "Pourcentage",
                    },
                  }}
                  className="absolute inset-0 h-full w-full"
                >
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            )}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 pb-2 shrink-0">
              {statusData.map((item: any) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground truncate" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-medium ml-2">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
