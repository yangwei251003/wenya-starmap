'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ProgressAnalysis as ProgressAnalysisType } from '@/lib/progress-tracking-service'

interface ProgressAnalysisProps {
  analysis: ProgressAnalysisType
}

export function ProgressAnalysis({ analysis }: ProgressAnalysisProps) {
  const { strengths, weaknesses, recommendations, projectedCompletion } = analysis

  return (
    <Card variant="sprout">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>📊</span>
          <span>学习分析</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 优势 */}
        {strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sprout-200 font-semibold mb-3 flex items-center gap-2">
              <span>💪</span>
              <span>你的优势</span>
            </h3>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-sprout-900/30 rounded-lg p-3 border-l-4 border-sprout-400"
                >
                  <p className="text-white text-sm">{strength}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 待改进 */}
        {weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sprout-200 font-semibold mb-3 flex items-center gap-2">
              <span>🎯</span>
              <span>待改进</span>
            </h3>
            <div className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-sprout-900/30 rounded-lg p-3 border-l-4 border-star-400"
                >
                  <p className="text-white text-sm">{weakness}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 学习建议 */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sprout-200 font-semibold mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>学习建议</span>
            </h3>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-sprout-900/30 rounded-lg p-3 flex items-start gap-3"
                >
                  <span className="text-star-400 text-lg flex-shrink-0">✓</span>
                  <p className="text-white text-sm">{recommendation}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 预计完成时间 */}
        {projectedCompletion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-sprout-900/50 to-star-900/50 rounded-lg p-4 border border-sprout-400/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sprout-200 text-sm mb-1">预计完成时间</p>
                <p className="text-white text-lg font-semibold">
                  {projectedCompletion.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
          </motion.div>
        )}

        {/* 空状态 */}
        {strengths.length === 0 && weaknesses.length === 0 && recommendations.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-sprout-200 mb-2">继续学习以获取分析</p>
            <p className="text-sprout-300 text-sm">
              完成更多课程后，我们将为你提供详细的学习分析
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
