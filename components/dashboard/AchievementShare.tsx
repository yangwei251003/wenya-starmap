'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarAchievement } from '@/types'
import { Button } from '@/components/ui/Button'

interface AchievementShareProps {
  achievement: StarAchievement
  isOpen: boolean
  onClose: () => void
}

export function AchievementShare({ achievement, isOpen, onClose }: AchievementShareProps) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成分享文本
  const generateShareText = () => {
    return `🎉 我在问芽星图获得了新成就！\n\n⭐ ${achievement.title}\n${achievement.description}\n\n一起来学习英语吧！`
  }

  // 复制到剪贴板
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // 生成分享图片
  const generateShareImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    canvas.width = 800
    canvas.height = 600

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1e1b4b') // cosmos-900
    gradient.addColorStop(1, '#312e81') // cosmos-800
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制星星背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 2
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制标题
    ctx.fillStyle = '#facc15' // star-400
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🎉 新成就解锁！', canvas.width / 2, 100)

    // 绘制成就图标
    ctx.font = '120px sans-serif'
    ctx.fillText(achievement.metadata?.icon || '⭐', canvas.width / 2, 250)

    // 绘制成就名称
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(achievement.title, canvas.width / 2, 350)

    // 绘制成就描述
    ctx.fillStyle = '#d1d5db'
    ctx.font = '24px sans-serif'
    ctx.fillText(achievement.description, canvas.width / 2, 400)

    // 绘制日期
    ctx.fillStyle = '#9ca3af'
    ctx.font = '18px sans-serif'
    const dateStr = new Date(achievement.earnedAt).toLocaleDateString('zh-CN')
    ctx.fillText(`获得于 ${dateStr}`, canvas.width / 2, 450)

    // 绘制底部文字
    ctx.fillStyle = '#84cc16' // sprout-400
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('问芽星图 - AI英语学习平台', canvas.width / 2, 550)
  }

  // 下载图片
  const handleDownloadImage = () => {
    generateShareImage()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `achievement-${achievement.id}.png`
      link.click()
      URL.revokeObjectURL(url)
    })
  }

  // 分享到社交媒体（模拟）
  const handleShareToSocial = (platform: string) => {
    const text = encodeURIComponent(generateShareText())
    let url = ''

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`
        break
      case 'weibo':
        url = `https://service.weibo.com/share/share.php?title=${text}`
        break
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-cosmos-800 to-cosmos-900 rounded-2xl p-6 max-w-md w-full border-2 border-star-400/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-star-400 mb-2">
                分享成就
              </h2>
              <p className="text-cosmos-300 text-sm">
                让朋友们看看你的学习成果
              </p>
            </div>

            {/* 成就预览 */}
            <div className="bg-cosmos-700/50 rounded-lg p-6 mb-6 text-center">
              <div className="text-6xl mb-3">
                {achievement.metadata?.icon || '⭐'}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {achievement.title}
              </h3>
              <p className="text-cosmos-300 text-sm">
                {achievement.description}
              </p>
            </div>

            {/* 分享选项 */}
            <div className="space-y-3">
              {/* 复制文本 */}
              <Button
                variant="sprout"
                className="w-full"
                onClick={handleCopyText}
              >
                {copied ? '✓ 已复制' : '📋 复制分享文本'}
              </Button>

              {/* 下载图片 */}
              <Button
                variant="star"
                className="w-full"
                onClick={handleDownloadImage}
              >
                📸 下载分享图片
              </Button>

              {/* 社交媒体分享 */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="cosmos"
                  className="text-sm"
                  onClick={() => handleShareToSocial('weibo')}
                >
                  微博
                </Button>
                <Button
                  variant="cosmos"
                  className="text-sm"
                  onClick={() => handleShareToSocial('twitter')}
                >
                  Twitter
                </Button>
                <Button
                  variant="cosmos"
                  className="text-sm"
                  onClick={() => handleShareToSocial('facebook')}
                >
                  Facebook
                </Button>
              </div>
            </div>

            {/* 关闭按钮 */}
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-cosmos-400 hover:text-cosmos-200 text-sm transition-colors"
              >
                关闭
              </button>
            </div>

            {/* 隐藏的画布用于生成图片 */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
