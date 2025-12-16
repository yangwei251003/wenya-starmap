'use client'

import { ExerciseType } from '@/types'
import { Card } from '@/components/ui/Card'

interface ExerciseTypeSelectorProps {
  onSelect: (type: ExerciseType) => void
}

interface ExerciseTypeOption {
  type: ExerciseType
  title: string
  description: string
  icon: string
  color: string
}

const exerciseTypes: ExerciseTypeOption[] = [
  {
    type: 'multiple_choice',
    title: '选择题',
    description: '从选项中选择正确答案',
    icon: '✓',
    color: 'from-blue-500 to-blue-600'
  },
  {
    type: 'fill_blank',
    title: '填空题',
    description: '填写正确的单词或短语',
    icon: '✍️',
    color: 'from-green-500 to-green-600'
  },
  {
    type: 'listening',
    title: '听力练习',
    description: '听音频并回答问题',
    icon: '👂',
    color: 'from-purple-500 to-purple-600'
  },
  {
    type: 'speaking',
    title: '口语练习',
    description: '练习英语口语表达',
    icon: '🗣️',
    color: 'from-orange-500 to-orange-600'
  },
  {
    type: 'reading_comprehension',
    title: '阅读理解',
    description: '阅读文章并回答问题',
    icon: '📖',
    color: 'from-pink-500 to-pink-600'
  },
  {
    type: 'writing',
    title: '写作练习',
    description: '练习英语写作技能',
    icon: '📝',
    color: 'from-yellow-500 to-yellow-600'
  }
]

export function ExerciseTypeSelector({ onSelect }: ExerciseTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exerciseTypes.map((option) => (
        <div
          key={option.type}
          onClick={() => onSelect(option.type)}
          className="cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${option.color} 
                           flex items-center justify-center text-3xl mb-4`}
              >
                {option.icon}
              </div>
              <h3 className="text-lg font-semibold text-cosmos-100 mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-cosmos-400">{option.description}</p>
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}
