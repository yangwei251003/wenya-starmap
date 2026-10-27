'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CompletionCelebration } from '@/components/ui/CompletionCelebration'
import { 
  BookOpen, Play, CheckCircle, Star, Volume2, Lightbulb, 
  MessageCircle, Target, Award, ArrowRight, ChevronRight, VolumeX 
} from 'lucide-react'
import { allLessons } from '@/lib/lessons-data'
import { speechService } from '@/lib/speech-service'

export default function LessonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string
  
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [exerciseResults, setExerciseResults] = useState<Record<string, boolean>>({})
  const [startTime] = useState(Date.now())
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

  const lesson = allLessons.find(l => l.id === lessonId)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 播放语音
  const handlePlayAudio = async (text: string, id: string) => {
    if (playingAudio === id) {
      // 如果正在播放这个，则停止
      speechService.stop()
      setPlayingAudio(null)
      return
    }

    // 停止其他正在播放的
    if (playingAudio) {
      speechService.stop()
    }

    setPlayingAudio(id)
    
    try {
      await speechService.speak(text, { rate: 0.8, pitch: 1 })
    } catch (error) {
      console.error('语音播放失败:', error)
    } finally {
      setPlayingAudio(null)
    }
  }

  // 播放单词（慢速+快速）
  const handlePlayWord = async (word: string, id: string) => {
    if (playingAudio === id) {
      speechService.stop()
      setPlayingAudio(null)
      return
    }

    if (playingAudio) {
      speechService.stop()
    }

    setPlayingAudio(id)
    
    try {
      await speechService.speakWord(word)
    } catch (error) {
      console.error('单词播放失败:', error)
    } finally {
      setPlayingAudio(null)
    }
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-cosmos-300 mb-4">课程未找到</p>
          <Button onClick={() => router.push('/lesson')}>返回课程列表</Button>
        </Card>
      </div>
    )
  }

  const steps = [
    { id: 'intro', title: '课程介绍', icon: BookOpen },
    { id: 'vocabulary', title: '核心词汇', icon: Star },
    { id: 'grammar', title: '语法要点', icon: Lightbulb },
    { id: 'dialogue', title: '对话练习', icon: MessageCircle },
    { id: 'exercises', title: '课后练习', icon: Target }
  ]

  const handleStepComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 完成所有步骤
      setShowCelebration(true)
      // 保存学习记录
      const completedLessons = JSON.parse(localStorage.getItem('completed_lessons') || '[]')
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId)
        localStorage.setItem('completed_lessons', JSON.stringify(completedLessons))
      }
    }
  }

  const handleExerciseAnswer = (exerciseId: string, answer: string) => {
    setExerciseAnswers({ ...exerciseAnswers, [exerciseId]: answer })
  }

  const checkExercises = () => {
    const results: Record<string, boolean> = {}
    lesson.exercises.forEach(ex => {
      results[ex.id] = exerciseAnswers[ex.id] === ex.correctAnswer
    })
    setExerciseResults(results)
    
    // 如果全部正确，标记为完成
    const allCorrect = Object.values(results).every(r => r)
    if (allCorrect) {
      setTimeout(() => handleStepComplete(), 1000)
    }
  }

  const correctCount = Object.values(exerciseResults).filter(r => r).length
  const totalCount = lesson.exercises.length

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-sprout-400 to-star-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{lesson.title}</h2>
              <p className="text-xl text-cosmos-300 mb-4">{lesson.titleEn}</p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-cosmos-400">
                  <Star className="w-4 h-4 text-star-400" />
                  +{lesson.xp} XP
                </span>
                <span className="px-3 py-1 bg-sprout-400/20 text-sprout-400 rounded-full">
                  {lesson.level}
                </span>
              </div>
            </div>

            <Card className="p-6 bg-cosmos-800/50">
              <h3 className="text-lg font-semibold text-white mb-3">课程简介</h3>
              <p className="text-cosmos-300 leading-relaxed">{lesson.introduction}</p>
            </Card>

            <Card className="p-6 bg-cosmos-800/50">
              <h3 className="text-lg font-semibold text-white mb-3">学习目标</h3>
              <ul className="space-y-2">
                {lesson.objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-cosmos-300">
                    <CheckCircle className="w-5 h-5 text-sprout-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Button variant="star" onClick={handleStepComplete} className="w-full">
              开始学习
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )

      case 'vocabulary':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">核心词汇</h2>
              <p className="text-cosmos-400">掌握这些关键词汇</p>
            </div>

            <div className="space-y-4">
              {lesson.vocabulary.map((vocab, idx) => {
                const wordId = `word-${idx}`
                const exampleId = `example-${idx}`
                const isPlayingWord = playingAudio === wordId
                const isPlayingExample = playingAudio === exampleId
                
                return (
                  <Card key={idx} className="p-5 bg-cosmos-800/50 hover:border-star-400/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-white">{vocab.word}</h3>
                          <button 
                            onClick={() => handlePlayWord(vocab.word, wordId)}
                            className={`p-2 rounded-lg transition-all ${
                              isPlayingWord 
                                ? 'bg-red-400/20 hover:bg-red-400/30' 
                                : 'bg-star-400/20 hover:bg-star-400/30'
                            }`}
                            title={isPlayingWord ? '停止播放' : '播放发音'}
                          >
                            {isPlayingWord ? (
                              <VolumeX className="w-5 h-5 text-red-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-5 h-5 text-star-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-cosmos-400">{vocab.pronunciation}</p>
                      </div>
                    </div>
                    <p className="text-sprout-400 mb-3">{vocab.translation}</p>
                    <div className="bg-cosmos-900/50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-white mb-1">{vocab.example}</p>
                          <p className="text-sm text-cosmos-400">{vocab.exampleTranslation}</p>
                        </div>
                        <button 
                          onClick={() => handlePlayAudio(vocab.example, exampleId)}
                          className={`p-1.5 rounded transition-all flex-shrink-0 ${
                            isPlayingExample 
                              ? 'bg-red-400/20 hover:bg-red-400/30' 
                              : 'bg-cosmos-700 hover:bg-cosmos-600'
                          }`}
                          title={isPlayingExample ? '停止播放' : '播放例句'}
                        >
                          {isPlayingExample ? (
                            <VolumeX className="w-4 h-4 text-red-400 animate-pulse" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-cosmos-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Button variant="sprout" onClick={handleStepComplete} className="w-full">
              继续学习
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )

      case 'grammar':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">语法要点</h2>
              <p className="text-cosmos-400">理解这些语法规则</p>
            </div>

            <div className="space-y-6">
              {lesson.grammarPoints.map((point, idx) => (
                <Card key={idx} className="p-6 bg-cosmos-800/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-star-400" />
                    {point.title}
                  </h3>
                  <p className="text-cosmos-300 mb-4">{point.explanation}</p>
                  
                  <div className="bg-cosmos-900/50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-cosmos-400 mb-2">示例：</h4>
                    <ul className="space-y-2">
                      {point.examples.map((ex, i) => (
                        <li key={i} className="text-white flex items-start gap-2">
                          <span className="text-sprout-400">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {point.tips.length > 0 && (
                    <div className="bg-sprout-400/10 border border-sprout-400/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-sprout-400 mb-2">💡 小贴士：</h4>
                      <ul className="space-y-1">
                        {point.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-cosmos-300">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            <Button variant="sprout" onClick={handleStepComplete} className="w-full">
              继续学习
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )

      case 'dialogue':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">对话练习</h2>
              <p className="text-cosmos-400">学习实际对话场景</p>
            </div>

            <div className="space-y-6">
              {lesson.dialogues.map((dialogue, idx) => (
                <Card key={idx} className="p-6 bg-cosmos-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-400" />
                    {dialogue.title}
                  </h3>
                  
                  <div className="space-y-3 mb-4">
                    {dialogue.lines.map((line, i) => {
                      const lineId = `dialogue-${idx}-line-${i}`
                      const isPlaying = playingAudio === lineId
                      
                      return (
                        <div key={i} className={`p-4 rounded-lg ${
                          i % 2 === 0 ? 'bg-sprout-400/10 border-l-4 border-sprout-400' : 'bg-star-400/10 border-l-4 border-star-400'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{line.speaker}:</span>
                            <button 
                              onClick={() => handlePlayAudio(line.text, lineId)}
                              className={`p-1 rounded transition-all ${
                                isPlaying 
                                  ? 'bg-red-400/20 hover:bg-red-400/30' 
                                  : 'bg-cosmos-700 hover:bg-cosmos-600'
                              }`}
                              title={isPlaying ? '停止播放' : '播放对话'}
                            >
                              {isPlaying ? (
                                <VolumeX className="w-4 h-4 text-red-400 animate-pulse" />
                              ) : (
                                <Volume2 className="w-4 h-4 text-cosmos-300" />
                              )}
                            </button>
                          </div>
                          <p className="text-white mb-1">{line.text}</p>
                          <p className="text-sm text-cosmos-400">{line.translation}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-cosmos-900/50 rounded-lg p-4">
                    <p className="text-sm text-cosmos-300">{dialogue.translation}</p>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="sprout" onClick={handleStepComplete} className="w-full">
              继续学习
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )

      case 'exercises':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">课后练习</h2>
              <p className="text-cosmos-400">测试你的学习成果</p>
            </div>

            <div className="space-y-6">
              {lesson.exercises.map((exercise, idx) => (
                <Card key={exercise.id} className="p-6 bg-cosmos-800/50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 bg-star-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-star-400 font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-3">{exercise.question}</p>
                      
                      {exercise.type === 'multiple-choice' && exercise.options && (
                        <div className="space-y-2">
                          {exercise.options.map((option, i) => (
                            <button
                              key={i}
                              onClick={() => handleExerciseAnswer(exercise.id, option)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                exerciseAnswers[exercise.id] === option
                                  ? exerciseResults[exercise.id] === true
                                    ? 'border-sprout-400 bg-sprout-400/20'
                                    : exerciseResults[exercise.id] === false
                                    ? 'border-red-400 bg-red-400/20'
                                    : 'border-star-400 bg-star-400/20'
                                  : 'border-cosmos-600 hover:border-cosmos-500'
                              }`}
                            >
                              <span className="text-white">{option}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {exercise.type === 'fill-blank' && (
                        <input
                          type="text"
                          value={exerciseAnswers[exercise.id] || ''}
                          onChange={(e) => handleExerciseAnswer(exercise.id, e.target.value)}
                          placeholder="输入答案..."
                          className="w-full px-4 py-3 bg-cosmos-900 border-2 border-cosmos-600 rounded-lg text-white focus:border-star-400 focus:outline-none"
                        />
                      )}

                      {exerciseResults[exercise.id] !== undefined && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          exerciseResults[exercise.id] 
                            ? 'bg-sprout-400/20 border border-sprout-400/30' 
                            : 'bg-red-400/20 border border-red-400/30'
                        }`}>
                          <p className={`text-sm ${
                            exerciseResults[exercise.id] ? 'text-sprout-400' : 'text-red-400'
                          }`}>
                            {exerciseResults[exercise.id] ? '✓ 正确！' : '✗ 错误'}
                          </p>
                          <p className="text-sm text-cosmos-300 mt-1">{exercise.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {Object.keys(exerciseResults).length === 0 ? (
              <Button variant="star" onClick={checkExercises} className="w-full">
                提交答案
              </Button>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white mb-2">
                    {correctCount} / {totalCount}
                  </p>
                  <p className="text-cosmos-400">
                    {correctCount === totalCount ? '太棒了！全部正确！' : '继续加油！'}
                  </p>
                </div>
                {correctCount === totalCount && (
                  <Button variant="sprout" onClick={handleStepComplete} className="w-full">
                    完成课程
                    <Award className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={lesson.title}
        subtitle={lesson.titleEn}
        titleColor="sprout"
        backUrl="/lesson"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 进度指示器 */}
        <Card className="p-4 mb-6 bg-cosmos-800/50">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = idx === currentStep
              const isCompleted = completedSteps.includes(idx)
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${idx < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-sprout-400 text-white' 
                        : isActive 
                        ? 'bg-star-400 text-white' 
                        : 'bg-cosmos-700 text-cosmos-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 hidden sm:block ${
                      isActive ? 'text-white font-semibold' : 'text-cosmos-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      completedSteps.includes(idx) ? 'bg-sprout-400' : 'bg-cosmos-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="h-2 bg-cosmos-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </Card>

        {/* 课程内容 */}
        <div className={mounted ? 'animate-fade-in-up' : 'opacity-0'}>
          {renderStepContent()}
        </div>
      </div>

      {/* 完成庆祝 */}
      <CompletionCelebration
        isVisible={showCelebration}
        onClose={() => {
          setShowCelebration(false)
          router.push('/lesson')
        }}
        onContinue={() => {
          setShowCelebration(false)
          router.push('/lesson')
        }}
        onGoHome={() => router.push('/dashboard')}
        title="课程完成！"
        subtitle={`你完成了「${lesson.title}」`}
        correctCount={correctCount}
        totalCount={totalCount}
        timeSpent={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={lesson.xp}
        encouragement="🎉 太棒了！继续保持学习热情！"
      />
    </div>
  )
}
