'use client';

import React, { useState } from 'react';
import {
  Heart,
  Battery,
  AlertTriangle,
  Moon,
  MessageSquare,
  TrendingUp,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/common';
import { useWellnessMockStore } from '@/store/useWellnessMockStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MOODS = [
  { val: 1, label: 'Sad/Tired', emoji: '😢' },
  { val: 2, label: 'Anxious', emoji: '😕' },
  { val: 3, label: 'Neutral', emoji: '😐' },
  { val: 4, label: 'Good', emoji: '🙂' },
  { val: 5, label: 'Energized', emoji: '😄' },
];

export default function WellnessPage() {
  const { wellnessLogs, addWellnessLog } = useWellnessMockStore();

  // Log Form State
  const [selectedMood, setSelectedMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [stress, setStress] = useState(2);
  const [sleep, setSleep] = useState(7.5);
  const [reflection, setReflection] = useState('');

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0]!;

    // Check if logged already today to prevent duplicates (optional alert)
    const exists = wellnessLogs.some((l) => l.date === dateStr);
    if (exists) {
      toast.info('Updating wellness index for today.');
    }

    addWellnessLog({
      mood: selectedMood,
      energyLevel: energy,
      stressLevel: stress,
      sleepHours: Number(sleep),
      reflection,
      date: dateStr,
    });

    setReflection('');
  };

  // Calculations
  const averageSleep =
    wellnessLogs.length > 0
      ? Number(
          (
            wellnessLogs.reduce((acc, curr) => acc + curr.sleepHours, 0) /
            wellnessLogs.length
          ).toFixed(1)
        )
      : 7.0;

  const averageStress =
    wellnessLogs.length > 0
      ? Number(
          (
            wellnessLogs.reduce((acc, curr) => acc + curr.stressLevel, 0) /
            wellnessLogs.length
          ).toFixed(1)
        )
      : 2.0;

  const averageEnergy =
    wellnessLogs.length > 0
      ? Number(
          (
            wellnessLogs.reduce((acc, curr) => acc + curr.energyLevel, 0) /
            wellnessLogs.length
          ).toFixed(1)
        )
      : 4.0;

  // Compile trend chart data
  const chartData = [...wellnessLogs]
    .reverse()
    .slice(-7)
    .map((log) => ({
      date: log.date.split('-').slice(1).join('/'),
      Mood: log.mood,
      Energy: log.energyLevel,
      Stress: log.stressLevel,
    }));

  return (
    <div className="space-y-6 text-xs">
      <PageHeader
        title="Stress & Study Wellness Tracker"
        subtitle="Manage cognitive load, record sleep quality, and monitor stress balances during session crunches."
      />

      {/* KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard
          title="Average sleep duration"
          value={`${averageSleep}h`}
          icon={<Moon className="h-4 w-4 text-indigo-600" />}
          subtitle="Recommendation: 7-8h"
        />
        <StatCard
          title="Stress Load index"
          value={`${averageStress} / 5`}
          icon={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          subtitle={
            averageStress >= 4 ? 'High stress warning' : 'Normal stress range'
          }
        />
        <StatCard
          title="Energy reserve balance"
          value={`${averageEnergy} / 5`}
          icon={<Battery className="h-4 w-4 text-emerald-600" />}
          subtitle="Optimal focus levels"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: Log Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-rose-500" /> Log daily metrics
              </h3>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleLogSubmit} className="space-y-4">
                {/* Mood emoji row */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground block mb-1">
                    How is your mood today?
                  </label>
                  <div className="flex justify-between gap-1 border border-border/80 p-2 rounded bg-card">
                    {MOODS.map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        onClick={() => setSelectedMood(m.val)}
                        className={`flex flex-col items-center p-1.5 rounded transition-all hover:scale-110 ${
                          selectedMood === m.val
                            ? 'bg-purple-600/10 ring-1 ring-purple-600/20'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[8px] font-bold text-muted-foreground mt-0.5">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy & Stress */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground block">
                      Energy level (1-5)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={energy}
                      onChange={(e) => setEnergy(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-[10px] text-muted-foreground text-center block mt-1 font-bold">
                      Level: {energy}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-muted-foreground block">
                      Stress level (1-5)
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={stress}
                      onChange={(e) => setStress(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-[10px] text-muted-foreground text-center block mt-1 font-bold">
                      Level: {stress}
                    </span>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Sleep duration last night (hours)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={24}
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden text-xs"
                  />
                </div>

                {/* Reflection */}
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">
                    Quick learning reflection / diary note
                  </label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="e.g. Completed networks study. Feeling solid but transport layers encapsulation needs a second look."
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 shadow-xs focus:outline-hidden text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-9"
                >
                  Save Daily Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right columns: Charts & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart */}
          <Card className="border border-border">
            <CardHeader className="pb-1.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-purple-600" /> Wellness
                index trends (Last 7 days)
              </h3>
            </CardHeader>
            <CardContent className="h-64 pt-2">
              {chartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 italic">
                  No logs recorded yet. Save an entry to render the trend.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={[1, 5]}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Mood"
                      stroke="#a855f7"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Energy"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Stress"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* History ledger */}
          <Card className="border border-border">
            <CardHeader className="pb-1.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-purple-600" /> Reflection
                History Ledger
              </h3>
            </CardHeader>
            <CardContent className="pt-1.5 space-y-3.5 max-h-[300px] overflow-y-auto">
              {wellnessLogs.length > 0 ? (
                wellnessLogs.map((log) => {
                  const moodEmoji =
                    MOODS.find((m) => m.val === log.mood)?.emoji || '😐';
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 border border-border/50 rounded-xl bg-card flex items-start gap-3"
                    >
                      <span className="text-2xl shrink-0 leading-none">
                        {moodEmoji}
                      </span>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <p className="font-bold text-foreground">
                            Logged: {log.date}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-semibold flex gap-2">
                            <span>🔋 Energy: {log.energyLevel}</span>
                            <span>⚡ Stress: {log.stressLevel}</span>
                            <span>🌙 Sleep: {log.sleepHours}h</span>
                          </span>
                        </div>
                        {log.reflection && (
                          <div className="p-2 border border-border/40 rounded bg-muted/20 flex gap-1.5 items-start">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <p className="text-muted-foreground leading-relaxed italic">
                              {log.reflection}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No logged reflection history.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
