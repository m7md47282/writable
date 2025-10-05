import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Heart, TrendingUp, Target, Award } from "lucide-react";

interface DashboardStatsProps {
  articlesRead: number;
  favorites: number;
  weeklyGoal?: number;
  readingStreak?: number;
  totalMinutes?: number;
}

export default function DashboardStats({ 
  articlesRead, 
  favorites,
  weeklyGoal = 15,
  readingStreak = 5,
  totalMinutes = 150
}: DashboardStatsProps) {
  const weeklyProgress = Math.min((articlesRead / weeklyGoal) * 100, 100);
  const isGoalAchieved = articlesRead >= weeklyGoal;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Reading Overview
          </CardTitle>
          <CardDescription>
            Your reading progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{articlesRead}</p>
              <p className="text-sm text-gray-600">Articles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{favorites}</p>
              <p className="text-sm text-gray-600">Favorites</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
              </div>
              <Badge variant={isGoalAchieved ? "default" : "secondary"}>
                {articlesRead}/{weeklyGoal}
              </Badge>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
            <p className="text-xs text-gray-500">
              {isGoalAchieved 
                ? `🎉 Goal achieved! You've read ${articlesRead - weeklyGoal} extra articles.`
                : `${weeklyGoal - articlesRead} more articles to reach your weekly goal.`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{readingStreak} Day Streak</p>
                <p className="text-sm text-gray-600">Keep it up!</p>
              </div>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              🔥 Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Average reading time per article</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(totalMinutes / Math.max(articlesRead, 1))} min
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Favorite rate</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round((favorites / Math.max(articlesRead, 1)) * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">This week&apos;s progress</span>
            <Badge variant={weeklyProgress >= 100 ? "default" : "outline"}>
              {Math.round(weeklyProgress)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
