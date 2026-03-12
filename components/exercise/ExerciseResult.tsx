'use client'

import { motion } from 'framer-motion'
import { ExerciseResult as ExerciseResultType } from '@/lib/exercise-service'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ExerciseResultProps {
  result: ExerciseResultType
  onRestart: () => void
  onBackToMenu: () => void
  analysisLoading?: boolean
}

export function ExerciseResult({
  result,
  onRestart,
  onBackToMenu,
  analysisLoading = false
}: ExerciseResultProps) {
  const accuracyPercentage = Math.round(result.accuracy * 100)
  const minutes = Math.floor(result.totalTime / 60)
  const seconds = Math.round(result.totalTime % 60)

  const getPerformanceMessage = () => {
    if (accuracyPercentage === 100) return '完美！'
    if (accuracyPercentage >= 80) return '优秀！'
    if (accuracyPercentage >= 60) return '良好！'
    return '继续努力！'
  }

  const getPerformanceColor = () => {
    if (accuracyPercentage >= 80) return 'text-green-400'
    if (accuracyPercentage >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        {/* 标题 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-star-400 mb-2">
            {getPerformanceMessage()}
          </h2>
          <p className="text-cosmos-300">练习完成</p>
        </motion.div>

        {/* 分数圆环 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-48 h-48">
            {/* 背景圆 */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-cosmos-700"
              />
              {/* 进度圆 */}
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                className={getPerformanceColor()}
                initial={{ strokeDasharray: '0 552' }}
                animate={{
                  strokeDasharray: `${(accuracyPercentage / 100) * 552} 552`
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
            {/* 中心文字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getPerformanceColor()}`}>
                {accuracyPercentage}%
              </span>
              <span className="text-sm text-cosmos-400">正确率</span>
            </div>
          </div>
        </motion.div>

        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-cosmos-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-cosmos-100">
              {result.correctAnswers}/{result.totalExercises}
            </p>
            <p className="text-sm text-cosmos-400">答对题数</p>
          </div>
          <div className="bg-cosmos-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-cosmos-100">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-cosmos-400">用时</p>
          </div>
          <div className="bg-cosmos-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-cosmos-100">{result.score}</p>
            <p className="text-sm text-cosmos-400">总分</p>
          </div>
          <div className="bg-cosmos-800 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-cosmos-100">
              {result.achievements.length}
            </p>
            <p className="text-sm text-cosmos-400">新成就</p>
          </div>
        </motion.div>

        {/* AI反馈 */}
        {result.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-sprout-500/10 to-star-500/10 p-4 rounded-lg mb-6 border-2 border-sprout-400/30"
          >
            <h3 className="text-lg font-semibold text-cosmos-100 mb-2 flex items-center gap-2">
              <span>🤖</span>
              <span>AI导师反馈</span>
            </h3>
            <p className="text-cosmos-200">{result.feedback}</p>
          </motion.div>
        )}

        {/* AI错题解析 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-cosmos-800/40 p-4 rounded-lg mb-6 border border-cosmos-700"
        >
          <h3 className="text-lg font-semibold text-cosmos-100 mb-3 flex items-center gap-2">
            <span>🤖</span>
            <span>AI错题解析</span>
          </h3>

          {analysisLoading && (
            <div className="space-y-2">
              <div className="h-16 bg-cosmos-700/40 rounded-lg animate-pulse" />
              <div className="h-16 bg-cosmos-700/40 rounded-lg animate-pulse" />
            </div>
          )}

          {!analysisLoading && (!result.analysisItems || result.analysisItems.length === 0) && (
            <p className="text-cosmos-400 text-sm">本次没有错题，继续保持！</p>
          )}

          {!analysisLoading && result.analysisItems && result.analysisItems.length > 0 && (
            <div className="space-y-3">
              {result.analysisItems.map((item, idx) => (
                <details key={idx} className="bg-cosmos-900/40 rounded-lg p-3">
                  <summary className="cursor-pointer text-cosmos-200 font-medium">
                    错题解析 #{idx + 1}
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-cosmos-300">
                    <p><span className="text-cosmos-400">错误点：</span>{item.issue}</p>
                    <p><span className="text-cosmos-400">正确表达：</span>{item.correction}</p>
                    <p><span className="text-cosmos-400">讲解：</span>{item.explanation}</p>
                    <p><span className="text-cosmos-400">示例：</span>{item.example}</p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </motion.div>

        {/* 成就列表 */}
        {result.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-cosmos-100 mb-3">
              🏆 获得的成就
            </h3>
            <div className="space-y-2">
              {result.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-cosmos-800 p-3 rounded-lg flex items-center gap-3"
                >
                  <span className="text-2xl">
                    {achievement.metadata?.icon || '⭐'}
                  </span>
                  <div>
                    <p className="font-semibold text-cosmos-100">
                      {achievement.title}
                    </p>
                    <p className="text-sm text-cosmos-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3"
        >
          <Button onClick={onRestart} className="flex-1">
            再练一次
          </Button>
          <Button onClick={onBackToMenu} variant="outline" className="flex-1">
            返回菜单
          </Button>
        </motion.div>
      </Card>
    </div>
  )
}
