/**
 * 课程服务 - 管理所有课程数据和学习进度
 */

export interface LessonContent {
  id: string
  title: string
  titleEn: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // 分钟
  xp: number
  category: 'grammar' | 'vocabulary' | 'conversation' | 'listening' | 'writing'
  
  // 课程内容
  introduction: string
  objectives: string[]
  
  // 学习材料
  vocabulary: VocabularyItem[]
  grammarPoints: GrammarPoint[]
  dialogues: Dialogue[]
  examples: Example[]
  
  // 练习
  exercises: Exercise[]
  
  // 额外资源
  tips: string[]
  culturalNotes?: string[]
}

export interface VocabularyItem {
  word: string
  pronunciation: string
  translation: string
  example: string
  exampleTranslation: string
}

export interface GrammarPoint {
  title: string
  explanation: string
  examples: string[]
  tips: string[]
}

export interface Dialogue {
  title: string
  speakers: string[]
  lines: DialogueLine[]
  translation: string
}

export interface DialogueLine {
  speaker: string
  text: string
  translation: string
}

export interface Example {
  english: string
  chinese: string
  note?: string
}

export interface Exercise {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'translation' | 'speaking'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

// ==================== 初级课程 ====================

const beginnerLessons: LessonContent[] = [
  {
    id: 'beginner-1',
    title: '日常问候',
    titleEn: 'Daily Greetings',
    description: '学习基本的英语问候语和自我介绍',
    level: 'beginner',
    duration: 15,
    xp: 20,
    category: 'conversation',
    introduction: '问候是日常交流的开始。在这节课中，你将学习如何用英语打招呼、问候他人以及进行简单的自我介绍。',
    objectives: [
      '掌握常用的问候语',
      '学会询问和回答"你好吗"',
      '能够进行简单的自我介绍',
      '了解正式和非正式问候的区别'
    ],
    vocabulary: [
      {
        word: 'Hello',
        pronunciation: '/həˈloʊ/',
        translation: '你好',
        example: 'Hello! How are you?',
        exampleTranslation: '你好！你好吗？'
      },
      {
        word: 'Good morning',
        pronunciation: '/ɡʊd ˈmɔːrnɪŋ/',
        translation: '早上好',
        example: 'Good morning, everyone!',
        exampleTranslation: '大家早上好！'
      },
      {
        word: 'Nice to meet you',
        pronunciation: '/naɪs tuː miːt juː/',
        translation: '很高兴见到你',
        example: 'Nice to meet you, John.',
        exampleTranslation: '很高兴见到你，约翰。'
      },
      {
        word: 'How are you',
        pronunciation: '/haʊ ɑːr juː/',
        translation: '你好吗',
        example: 'Hi! How are you today?',
        exampleTranslation: '嗨！你今天好吗？'
      },
      {
        word: 'Fine',
        pronunciation: '/faɪn/',
        translation: '很好',
        example: "I'm fine, thank you.",
        exampleTranslation: '我很好，谢谢。'
      }
    ],
    grammarPoints: [
      {
        title: '问候语的使用时间',
        explanation: '不同的问候语适用于不同的时间段',
        examples: [
          'Good morning - 早上（5:00-12:00）',
          'Good afternoon - 下午（12:00-18:00）',
          'Good evening - 晚上（18:00-22:00）',
          'Good night - 晚安（睡前告别）'
        ],
        tips: [
          'Hello 和 Hi 可以在任何时间使用',
          'Good night 只用于告别，不用于见面问候'
        ]
      },
      {
        title: '回应"How are you?"',
        explanation: '询问对方近况时的常用回答',
        examples: [
          "I'm fine, thank you. - 我很好，谢谢",
          "I'm good, thanks. - 我很好，谢谢（更口语化）",
          "Not bad. - 还不错",
          "Pretty good. - 相当好"
        ],
        tips: [
          '通常在回答后也要反问对方：And you? / How about you?'
        ]
      }
    ],
    dialogues: [
      {
        title: '早晨见面',
        speakers: ['Tom', 'Lisa'],
        lines: [
          { speaker: 'Tom', text: 'Good morning, Lisa!', translation: '早上好，丽莎！' },
          { speaker: 'Lisa', text: 'Good morning, Tom! How are you?', translation: '早上好，汤姆！你好吗？' },
          { speaker: 'Tom', text: "I'm fine, thank you. And you?", translation: '我很好，谢谢。你呢？' },
          { speaker: 'Lisa', text: "I'm good, thanks!", translation: '我很好，谢谢！' }
        ],
        translation: '这是一个典型的早晨问候对话，展示了如何礼貌地打招呼和询问对方的近况。'
      },
      {
        title: '初次见面',
        speakers: ['John', 'Mary'],
        lines: [
          { speaker: 'John', text: 'Hello! My name is John.', translation: '你好！我叫约翰。' },
          { speaker: 'Mary', text: 'Hi John! Nice to meet you. I\'m Mary.', translation: '嗨约翰！很高兴见到你。我是玛丽。' },
          { speaker: 'John', text: 'Nice to meet you too, Mary!', translation: '我也很高兴见到你，玛丽！' }
        ],
        translation: '初次见面时的自我介绍对话。'
      }
    ],
    examples: [
      { english: 'Hello! How are you doing?', chinese: '你好！你过得怎么样？' },
      { english: 'Hi there! Long time no see!', chinese: '嗨！好久不见！' },
      { english: 'Good to see you again!', chinese: '很高兴再次见到你！' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: '早上10点见到朋友，你应该说：',
        options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
        correctAnswer: 'Good morning',
        explanation: '早上（5:00-12:00）应该使用 Good morning',
        points: 5
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: '当别人问 "How are you?" 时，你可以回答：',
        options: ["I'm fine, thank you", 'Good morning', 'Nice to meet you', 'Goodbye'],
        correctAnswer: "I'm fine, thank you",
        explanation: '"How are you?" 是询问近况，应该回答自己的状态',
        points: 5
      },
      {
        id: 'ex3',
        type: 'fill-blank',
        question: '初次见面时说：Nice to ___ you.',
        correctAnswer: 'meet',
        explanation: '"Nice to meet you" 是初次见面的标准问候语',
        points: 5
      },
      {
        id: 'ex4',
        type: 'translation',
        question: '翻译：很高兴再次见到你',
        correctAnswer: 'Nice to see you again',
        explanation: '再次见面用 "see" 而不是 "meet"',
        points: 10
      }
    ],
    tips: [
      '微笑和眼神交流在问候时很重要',
      '在正式场合使用完整的问候语（Good morning），非正式场合可以用 Hi/Hello',
      '记得在回答后也询问对方的情况，这是礼貌的表现',
      '初次见面用 "Nice to meet you"，再次见面用 "Nice to see you"'
    ],
    culturalNotes: [
      '在英语国家，问候时通常会保持一定的个人空间距离',
      '握手是常见的问候方式，但要注意文化差异',
      '"How are you?" 通常是礼貌性问候，不需要详细回答'
    ]
  },
  {
    id: 'beginner-2',
    title: '数字和时间',
    titleEn: 'Numbers and Time',
    description: '学习英语数字表达和时间的说法',
    level: 'beginner',
    duration: 20,
    xp: 25,
    category: 'vocabulary',
    introduction: '数字和时间是日常生活中最常用的表达。掌握它们将帮助你进行购物、预约、安排日程等活动。',
    objectives: [
      '掌握0-100的数字表达',
      '学会询问和表达时间',
      '了解12小时制和24小时制',
      '学习日期的表达方式'
    ],
    vocabulary: [
      {
        word: 'one, two, three',
        pronunciation: '/wʌn, tuː, θriː/',
        translation: '一、二、三',
        example: 'I have three apples.',
        exampleTranslation: '我有三个苹果。'
      },
      {
        word: "o'clock",
        pronunciation: '/əˈklɑːk/',
        translation: '点钟',
        example: "It's three o'clock.",
        exampleTranslation: '现在是三点钟。'
      },
      {
        word: 'half past',
        pronunciation: '/hæf pæst/',
        translation: '半点',
        example: "It's half past two.",
        exampleTranslation: '现在是两点半。'
      },
      {
        word: 'quarter',
        pronunciation: '/ˈkwɔːrtər/',
        translation: '一刻钟（15分钟）',
        example: "It's a quarter past three.",
        exampleTranslation: '现在是三点一刻。'
      }
    ],
    grammarPoints: [
      {
        title: '时间表达法',
        explanation: '英语中表达时间的两种主要方式',
        examples: [
          "3:00 - It's three o'clock",
          "3:15 - It's three fifteen / a quarter past three",
          "3:30 - It's three thirty / half past three",
          "3:45 - It's three forty-five / a quarter to four"
        ],
        tips: [
          '整点使用 o\'clock',
          '30分钟可以说 half past',
          '15分钟可以说 quarter past',
          '45分钟可以说 quarter to (下一个小时)'
        ]
      }
    ],
    dialogues: [
      {
        title: '询问时间',
        speakers: ['A', 'B'],
        lines: [
          { speaker: 'A', text: 'Excuse me, what time is it?', translation: '打扰一下，现在几点了？' },
          { speaker: 'B', text: "It's half past two.", translation: '现在是两点半。' },
          { speaker: 'A', text: 'Thank you!', translation: '谢谢！' },
          { speaker: 'B', text: "You're welcome.", translation: '不客气。' }
        ],
        translation: '询问时间的基本对话'
      }
    ],
    examples: [
      { english: "What's the time?", chinese: '几点了？' },
      { english: "It's 9:30 in the morning.", chinese: '现在是早上9点30分。' },
      { english: 'The meeting is at 3 PM.', chinese: '会议在下午3点。' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: '3:00 用英语怎么说？',
        options: ["three o'clock", 'three hours', 'three times', 'three minutes'],
        correctAnswer: "three o'clock",
        explanation: '整点时间使用 o\'clock',
        points: 5
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: '2:30 可以说成：',
        options: ['half past two', 'two half', 'half two', 'two and half'],
        correctAnswer: 'half past two',
        explanation: '半点使用 half past + 小时',
        points: 5
      },
      {
        id: 'ex3',
        type: 'fill-blank',
        question: "询问时间：What ___ is it?",
        correctAnswer: 'time',
        explanation: '"What time is it?" 是询问时间的标准表达',
        points: 5
      }
    ],
    tips: [
      '在口语中，通常省略 o\'clock',
      'AM 表示上午，PM 表示下午',
      '24小时制在正式场合更常用',
      '学习数字时要注意 thirteen 和 thirty 的发音区别'
    ]
  }
]

// 继续添加更多初级课程...
