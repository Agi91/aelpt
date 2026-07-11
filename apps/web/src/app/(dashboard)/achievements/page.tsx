'use client';

import React, { useState } from 'react';
import {
  Award,
  Zap,
  Trophy,
  BookOpen,
  Layers,
  Flame,
  Clock,
  Brain,
  History,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/common';
import { useGamificationMockStore } from '@/store/useGamificationMockStore';

export default function AchievementsPage() {
  const { xp, level, title, progressPercent, achievements, badges, xpHistory } =
    useGamificationMockStore();

  const [filterMode, setFilterMode] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>(
    'ALL'
  );

  const getIcon = (iconName: string, className?: string) => {
    const props = { className: className || 'h-5 w-5' };
    if (iconName === 'Zap') return <Zap {...props} />;
    if (iconName === 'Award') return <Award {...props} />;
    if (iconName === 'Trophy') return <Trophy {...props} />;
    if (iconName === 'BookOpen') return <BookOpen {...props} />;
    if (iconName === 'Layers') return <Layers {...props} />;
    if (iconName === 'Flame') return <Flame {...props} />;
    if (iconName === 'Clock') return <Clock {...props} />;
    return <Brain {...props} />;
  };

  const filteredAchievements = achievements.filter((ach) => {
    if (filterMode === 'UNLOCKED') return ach.unlockedAt !== undefined;
    if (filterMode === 'LOCKED') return ach.unlockedAt === undefined;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Milestones & Achievements"
        subtitle="Celebrate your academic accomplishments, track historical XP rewards, and showcase earned badges."
      />

      {/* Top row: Level Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border border-border bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-extrabold text-2xl">
                {level}
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Level {level}: {title}
                  <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                    {xp} Total XP
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Earn {1000 - (xp % 1000)} more XP to reach Level {level + 1}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-48 space-y-2 shrink-0">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>XP PROGRESS</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level breakdown guidelines */}
        <Card className="border border-border">
          <CardContent className="p-6 flex items-center gap-3 text-xs">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="space-y-0.5 leading-normal">
              <p className="font-bold text-foreground">XP Rewards Checklist:</p>
              <p className="text-muted-foreground">
                Topic: +100 XP | Unit: +250 XP | Subject: +500 XP
              </p>
              <p className="text-muted-foreground">
                Quiz Take: +150 XP | Flashcard: +5 XP / card
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Badges & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Achievements Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 flex-wrap gap-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-purple-600" /> Trophies &
                Milestones
              </h3>

              {/* Filters */}
              <div className="flex gap-2">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'UNLOCKED', label: 'Unlocked' },
                  { key: 'LOCKED', label: 'Locked' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() =>
                      setFilterMode(item.key as 'ALL' | 'UNLOCKED' | 'LOCKED')
                    }
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all duration-300 border ${
                      filterMode === item.key
                        ? 'border-purple-600 bg-purple-500/5 text-purple-700 dark:text-purple-400'
                        : 'border-border text-muted-foreground hover:bg-muted/40'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              {filteredAchievements.map((ach) => {
                const isUnlocked = ach.unlockedAt !== undefined;
                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 border rounded-xl flex gap-3.5 items-start transition-all duration-300 ${
                      isUnlocked
                        ? 'border-border bg-card'
                        : 'border-dashed border-border/60 bg-muted/5 opacity-75'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isUnlocked
                          ? 'bg-purple-600/10 text-purple-600 dark:text-purple-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {getIcon(ach.icon, 'h-5 w-5')}
                    </span>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {ach.title}
                            {isUnlocked && (
                              <span className="bg-green-500/10 text-green-700 dark:text-green-400 px-1.5 py-0.2 rounded-full text-[8px] font-bold">
                                Unlocked
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {ach.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-purple-600 dark:text-purple-400 shrink-0">
                          +{ach.xpReward} XP
                        </span>
                      </div>

                      {!isUnlocked && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                            <span>PROGRESS</span>
                            <span>{ach.progress}%</span>
                          </div>
                          <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${ach.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Badge Gallery & XP logs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Badge Gallery */}
          <Card className="border border-border">
            <CardHeader className="pb-1.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-purple-600" /> Badge collection
              </h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-xs pt-1.5">
              {badges.map((b) => {
                const isUnlocked = b.unlockedAt !== undefined;
                return (
                  <div
                    key={b.id}
                    className={`p-3 border rounded-xl text-center space-y-2 flex flex-col items-center justify-between ${
                      isUnlocked
                        ? 'border-purple-600/20 bg-purple-500/5'
                        : 'border-border/60 bg-muted/10 opacity-60'
                    }`}
                  >
                    <div className="relative">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          isUnlocked
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {getIcon(b.icon, 'h-6 w-6')}
                      </span>
                      {!isUnlocked && (
                        <span className="absolute -bottom-1 -right-1 bg-background border rounded-full p-0.5 shadow-2xs">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-[10px] text-foreground leading-snug">
                        {b.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground leading-normal mt-0.5">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* XP Log history */}
          {xpHistory.length > 0 && (
            <Card className="border border-border">
              <CardHeader className="pb-1.5">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-4 w-4 text-purple-600" /> XP history
                  audit
                </h3>
              </CardHeader>
              <CardContent className="pt-1.5 space-y-2.5 text-xs max-h-[300px] overflow-y-auto">
                {xpHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-3 border-b border-border/40 pb-2"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground leading-snug">
                        {item.reason}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      +{item.amount} XP
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
