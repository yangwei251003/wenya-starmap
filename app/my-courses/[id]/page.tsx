'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, Clock, Star, Play, CheckCircle, ChevronRight,
  Volume2, Mic, PenTool, Award, ArrowLeft, ArrowRight
} from 'lucide-react'
import { purchasedCoursesService } from '@/lib/purchased-courses-service'
import { getCourseById } from '@/lib/store-courses-data'
import { StoreCourse } from '@/types'

// 模拟课程内容
const generateLessonContent = (courseId: string, lessonIndex: number) => {
  const lessonTypes = ['vocabulary', 'grammar', 'dialogue', 'exercise', 'review']
  const type = lessonTypes[lessonIndex % lessonTypes.length]
  
  return {
    id: `${courseId}-lesson-${lessonIndex + 1}`,
    title: `第${lessonIndex + 1}课`,
    type,
    content: {
      vocabulary: {
        words: [
          { word: 'hello', meaning: '你好', example: 'Hello, how are you?' },
          { word: 'goodbye', meaning: '再见', example: 'Goodbye, see you tomorrow!' },
          { word: 'thank you', meaning: '谢谢', example: 'Thank you for your help.' },
        ]
      },
      grammar: {
        title: '基础语法',
        explanation: '学习基本的句子结构和时态用法。',
        examples: ['I am a student.', 'She is reading a book.', 'They are playing football.']
      },
      dialogue: {
        title: '日常对话',
        lines: [
          { speaker: 'A', text: 'Hi, how are you today?' },
          { speaker: 'B', text: "I'm fine, thank you. And you?" },
          { speaker: 'A', text: "I'm great! Nice weather today." },
        ]
      },
      exercise: {
        questions: [
          { question: 'How do you say "你好" in English?', answer: 'Hello' },
          { question: 'Complete: I ___ a student.', answer: 'am' },
        ]
      },
      review: {
        summary: '本课复习了基础词汇和语法知识。',
        keyPoints: ['问候语的使用', 'be动词的变化', '简单句的结构']
      }
    }
  }
}

export default function CourseLearningPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [course, setCourse] = useState<StoreCourse | null>(null)
  const [currentLesson, setCurrentLesson] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem('wenya_user')
    if (user) {
      const userData = JSON.parse(user)
      setUserId(userData.id)
      
      // 获取课程信息
      const courseData = getCourseById(courseId)
      if (courseData) {
        setCourse(courseData)
        // 获取学习进度
        const currentProgress = purchasedCoursesService.getProgress(userData.id, courseId)
        setProgress(currentProgress)
        // 计算已完成的课时
        const completedCount = Math.floor((currentProgress / 100) * courseData.lessonsCount)
        setCompletedLessons(Array.from({ length: completedCount }, (_, i) => i))
      }
    }
  }, [courseId])

  // 完成当前课时
  const completeLesson = () => {
    if (!course || !userId) return
    
    if (!completedLessons.includes(currentLesson)) {
      const newCompleted = [...completedLessons, currentLesson]
      setCompletedLessons(newCompleted)
      
      // 更新进度
      const newProgress = Math.round((newCompleted.length / course.lessonsCount) * 100)
      setProgress(newProgress)
      purchasedCoursesService.updateProgress(userId, courseId, newProgress)
    }
    
    // 进入下一课
    if (currentLesson < course.lessonsCount - 1) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  // 渲染课程内容
  const renderLessonContent = () => {
    if (!course) return null
    
    const lesson = generateLessonContent(courseId, currentLesson)
    const content = lesson.content
    
    return (
      <div className="space-y-6">
        {/* 词汇学习 */}
        {lesson.type === 'vocabulary' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sprout-400" />
              词汇学习
            </h3>
            <div className="space-y-3">
              {content.vocabulary.words.map((item, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-star-400">{item.word}</span>
                    <Button variant="outline" size="sm">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-cosmos-300 mb-1">{item.meaning}</p>
                  <p className="text-sm text-cosmos-400 italic">"{item.example}"</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 语法学习 */}
        {lesson.type === 'grammar' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-blue-400" />
              {content.grammar.title}
            </h3>
            <Card className="p-4 mb-4">
              <p className="text-cosmos-300">{content.grammar.explanation}</p>
            </Card>
            <div className="space-y-2">
              {content.grammar.examples.map((example, idx) => (
                <Card key={idx} className="p-3 bg-cosmos-800/50">
                  <p className="text-white">{example}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 对话练习 */}
        {lesson.type === 'dialogue' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" />
              {content.dialogue.title}
            </h3>
            <div className="space-y-3">
              {content.dialogue.lines.map((line, idx) => (
                <Card key={idx} className={`p-4 ${line.speaker === 'A' ? 'ml-0 mr-12' : 'ml-12 mr-0'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      line.speaker === 'A' ? 'bg-sprout-500' : 'bg-star-500'
                    }`}>
                      {line.speaker}
                    </span>
                    <Button variant="outline" size="sm">
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-white">{line.text}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 练习题 */}
        {lesson.type === 'exercise' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-400" />
              课后练习
            </h3>
            <div className="space-y-4">
              {content.exercise.questions.map((q, idx) => (
                <Card key={idx} className="p-4">
                  <p className="text-white mb-3">{idx + 1}. {q.question}</p>
                  <input 
                    type="text"
                    placeholder="输入你的答案..."
                    className="w-full p-3 bg-cosmos-800 border border-cosmos-700 rounded-lg text-white placeholder-cosmos-500 focus:border-sprout-400 focus:outline-none"
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 复习总结 */}
        {lesson.type === 'review' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-sprout-400" />
              课程总结
            </h3>
            <Card className="p-4 mb-4">
              <p className="text-cosmos-300">{content.review.summary}</p>
            </Card>
            <h4 className="text-lg font-semibold text-white mb-3">重点回顾</h4>
            <div className="space-y-2">
              {content.review.keyPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 text-cosmos-300">
                  <Star className="w-4 h-4 text-star-400" />
                  {point}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!mounted || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sprout-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title={course.title}
        subtitle={course.titleEn}
        titleColor="sprout"
        backUrl="/my-courses"
      />

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 进度卡片 */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sprout-400/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-sprout-400" />
              </div>
              <div>
                <p className="text-sm text-cosmos-400">学习进度</p>
                <p className="text-lg font-bold text-white">{completedLessons.length} / {course.lessonsCount} 课时</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-sprout-400">{progress}%</p>
            </div>
          </div>
          <div className="h-3 bg-cosmos-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sprout-400 to-star-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* 课时列表 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: course.lessonsCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentLesson(i)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                currentLesson === i
                  ? 'bg-sprout-400 text-white'
                  : completedLessons.includes(i)
                  ? 'bg-sprout-400/20 text-sprout-400'
                  : 'bg-cosmos-800 text-cosmos-400 hover:bg-cosmos-700'
              }`}
            >
              {completedLessons.includes(i) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                i + 1
              )}
            </button>
          ))}
        </div>

        {/* 课程内容 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              第 {currentLesson + 1} 课
            </h2>
            {completedLessons.includes(currentLesson) && (
              <span className="px-3 py-1 bg-sprout-400/20 text-sprout-400 text-sm rounded-full flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> 已完成
              </span>
            )}
          </div>
          
          {renderLessonContent()}
        </Card>

        {/* 导航按钮 */}
        <div className="flex items-center justify-between">
          <Button
            variant="cosmos"
            onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
            disabled={currentLesson === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一课
          </Button>

          {completedLessons.includes(currentLesson) ? (
            <Button
              variant="sprout"
              onClick={() => setCurrentLesson(Math.min(course.lessonsCount - 1, currentLesson + 1))}
              disabled={currentLesson === course.lessonsCount - 1}
            >
              下一课
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="star"
              onClick={completeLesson}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              完成本课
            </Button>
          )}
        </div>

        {/* 完成提示 */}
        {progress >= 100 && (
          <Card className="p-6 mt-6 text-center bg-gradient-to-r from-sprout-500/20 to-star-500/20 border-sprout-400/30">
            <Award className="w-16 h-16 text-star-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">🎉 恭喜完成课程！</h3>
            <p className="text-cosmos-300 mb-4">你已经完成了「{course.title}」的全部学习内容</p>
            <div className="flex gap-3 justify-center">
              <Button variant="cosmos" onClick={() => router.push('/my-courses')}>
                返回课程列表
              </Button>
              <Button variant="star" onClick={() => router.push('/store')}>
                继续学习更多
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
