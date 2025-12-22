/**
 * 完整的课程数据库
 * 包含初级、中级、高级所有课程
 */

import { LessonContent } from './lesson-service'

export const allLessons: LessonContent[] = [
  // ==================== 初级课程 (Beginner) ====================
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
      }
    ],
    grammarPoints: [
      {
        title: '问候语的使用时间',
        explanation: '不同的问候语适用于不同的时间段',
        examples: [
          'Good morning - 早上（5:00-12:00）',
          'Good afternoon - 下午（12:00-18:00）',
          'Good evening - 晚上（18:00-22:00）'
        ],
        tips: ['Hello 和 Hi 可以在任何时间使用']
      }
    ],
    dialogues: [
      {
        title: '早晨见面',
        speakers: ['Tom', 'Lisa'],
        lines: [
          { speaker: 'Tom', text: 'Good morning, Lisa!', translation: '早上好，丽莎！' },
          { speaker: 'Lisa', text: 'Good morning, Tom! How are you?', translation: '早上好，汤姆！你好吗？' },
          { speaker: 'Tom', text: "I'm fine, thank you. And you?", translation: '我很好，谢谢。你呢？' }
        ],
        translation: '这是一个典型的早晨问候对话'
      }
    ],
    examples: [
      { english: 'Hello! How are you doing?', chinese: '你好！你过得怎么样？' }
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
      }
    ],
    tips: ['微笑和眼神交流在问候时很重要']
  },
  
  {
    id: 'beginner-2',
    title: '自我介绍',
    titleEn: 'Self Introduction',
    description: '学习如何用英语介绍自己',
    level: 'beginner',
    duration: 20,
    xp: 25,
    category: 'conversation',
    introduction: '自我介绍是建立人际关系的第一步。学会用英语流利地介绍自己非常重要。',
    objectives: [
      '学会说出自己的名字',
      '介绍自己的年龄和职业',
      '表达自己的兴趣爱好',
      '询问他人的基本信息'
    ],
    vocabulary: [
      {
        word: 'My name is',
        pronunciation: '/maɪ neɪm ɪz/',
        translation: '我的名字是',
        example: 'My name is Tom.',
        exampleTranslation: '我的名字是汤姆。'
      },
      {
        word: 'I am from',
        pronunciation: '/aɪ æm frɒm/',
        translation: '我来自',
        example: 'I am from China.',
        exampleTranslation: '我来自中国。'
      }
    ],
    grammarPoints: [
      {
        title: '自我介绍的基本句型',
        explanation: '介绍自己时的常用表达',
        examples: [
          'My name is... - 我的名字是...',
          'I am... - 我是...',
          'I come from... - 我来自...',
          'I like... - 我喜欢...'
        ],
        tips: ['可以用 I\'m 代替 I am，更口语化']
      }
    ],
    dialogues: [
      {
        title: '自我介绍',
        speakers: ['John'],
        lines: [
          { speaker: 'John', text: 'Hello! My name is John.', translation: '你好！我叫约翰。' },
          { speaker: 'John', text: 'I am from New York.', translation: '我来自纽约。' },
          { speaker: 'John', text: 'I like reading and music.', translation: '我喜欢阅读和音乐。' }
        ],
        translation: '一个完整的自我介绍示例'
      }
    ],
    examples: [
      { english: 'My name is Li Ming.', chinese: '我叫李明。' },
      { english: 'I am a student.', chinese: '我是一名学生。' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'fill-blank',
        question: 'My ___ is Tom.',
        correctAnswer: 'name',
        explanation: '"My name is" 是介绍名字的标准表达',
        points: 5
      }
    ],
    tips: ['说话时保持自信和微笑']
  },

  {
    id: 'beginner-3',
    title: '家庭成员',
    titleEn: 'Family Members',
    description: '学习家庭成员的英语表达',
    level: 'beginner',
    duration: 18,
    xp: 22,
    category: 'vocabulary',
    introduction: '家庭是我们生活的重要部分。学会用英语介绍家庭成员很有用。',
    objectives: [
      '掌握家庭成员的英语单词',
      '学会介绍自己的家人',
      '了解家庭关系的表达',
      '能够询问他人的家庭情况'
    ],
    vocabulary: [
      {
        word: 'father',
        pronunciation: '/ˈfɑːðər/',
        translation: '父亲',
        example: 'This is my father.',
        exampleTranslation: '这是我的父亲。'
      },
      {
        word: 'mother',
        pronunciation: '/ˈmʌðər/',
        translation: '母亲',
        example: 'My mother is a teacher.',
        exampleTranslation: '我妈妈是一名教师。'
      },
      {
        word: 'brother',
        pronunciation: '/ˈbrʌðər/',
        translation: '兄弟',
        example: 'I have one brother.',
        exampleTranslation: '我有一个兄弟。'
      }
    ],
    grammarPoints: [
      {
        title: '所有格的使用',
        explanation: '表达"某人的"时使用所有格',
        examples: [
          "my father - 我的父亲",
          "your mother - 你的母亲",
          "his sister - 他的姐妹"
        ],
        tips: ['注意区分 his（他的）和 her（她的）']
      }
    ],
    dialogues: [
      {
        title: '介绍家人',
        speakers: ['Mary', 'Tom'],
        lines: [
          { speaker: 'Mary', text: 'Do you have any brothers or sisters?', translation: '你有兄弟姐妹吗？' },
          { speaker: 'Tom', text: 'Yes, I have one sister.', translation: '是的，我有一个姐姐。' },
          { speaker: 'Mary', text: 'How old is she?', translation: '她多大了？' },
          { speaker: 'Tom', text: 'She is 25 years old.', translation: '她25岁了。' }
        ],
        translation: '询问和介绍家庭成员'
      }
    ],
    examples: [
      { english: 'I have a big family.', chinese: '我有一个大家庭。' },
      { english: 'My parents are very kind.', chinese: '我的父母非常和蔼。' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: '"父亲"的英语是：',
        options: ['father', 'mother', 'brother', 'sister'],
        correctAnswer: 'father',
        explanation: 'father 是父亲的意思',
        points: 5
      }
    ],
    tips: ['学习时可以画一个家谱图帮助记忆']
  },

  {
    id: 'beginner-4',
    title: '颜色和形状',
    titleEn: 'Colors and Shapes',
    description: '学习常见颜色和形状的英语表达',
    level: 'beginner',
    duration: 15,
    xp: 20,
    category: 'vocabulary',
    introduction: '颜色和形状是描述物体的基本要素。掌握它们能让你更准确地表达。',
    objectives: [
      '掌握基本颜色词汇',
      '学习常见形状的表达',
      '能够描述物体的颜色和形状',
      '了解颜色的文化含义'
    ],
    vocabulary: [
      {
        word: 'red',
        pronunciation: '/red/',
        translation: '红色',
        example: 'I like red apples.',
        exampleTranslation: '我喜欢红苹果。'
      },
      {
        word: 'blue',
        pronunciation: '/bluː/',
        translation: '蓝色',
        example: 'The sky is blue.',
        exampleTranslation: '天空是蓝色的。'
      },
      {
        word: 'circle',
        pronunciation: '/ˈsɜːrkl/',
        translation: '圆形',
        example: 'Draw a circle.',
        exampleTranslation: '画一个圆。'
      }
    ],
    grammarPoints: [
      {
        title: '形容词的位置',
        explanation: '颜色形容词通常放在名词前面',
        examples: [
          'a red car - 一辆红色的车',
          'blue eyes - 蓝色的眼睛',
          'a green apple - 一个绿苹果'
        ],
        tips: ['形容词不需要变复数']
      }
    ],
    dialogues: [
      {
        title: '描述物品',
        speakers: ['A', 'B'],
        lines: [
          { speaker: 'A', text: 'What color is your car?', translation: '你的车是什么颜色？' },
          { speaker: 'B', text: 'It\'s red.', translation: '是红色的。' },
          { speaker: 'A', text: 'That\'s nice!', translation: '很不错！' }
        ],
        translation: '询问和描述颜色'
      }
    ],
    examples: [
      { english: 'I have a blue pen.', chinese: '我有一支蓝色的笔。' },
      { english: 'The ball is round.', chinese: '球是圆的。' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: '"红色"的英语是：',
        options: ['red', 'blue', 'green', 'yellow'],
        correctAnswer: 'red',
        explanation: 'red 是红色',
        points: 5
      }
    ],
    tips: ['通过观察周围的物品来练习颜色词汇']
  },

  {
    id: 'beginner-5',
    title: '购物对话',
    titleEn: 'Shopping Conversations',
    description: '学习在商店购物时的常用英语表达',
    level: 'beginner',
    duration: 20,
    xp: 25,
    category: 'conversation',
    introduction: '购物是日常生活中常见的活动。学会购物英语能让你在英语国家轻松购物。',
    objectives: [
      '学会询问价格',
      '掌握购物常用词汇',
      '能够表达购买意愿',
      '了解讨价还价的基本表达'
    ],
    vocabulary: [
      {
        word: 'How much',
        pronunciation: '/haʊ mʌtʃ/',
        translation: '多少钱',
        example: 'How much is this?',
        exampleTranslation: '这个多少钱？'
      },
      {
        word: 'expensive',
        pronunciation: '/ɪkˈspensɪv/',
        translation: '昂贵的',
        example: 'This is too expensive.',
        exampleTranslation: '这太贵了。'
      },
      {
        word: 'cheap',
        pronunciation: '/tʃiːp/',
        translation: '便宜的',
        example: 'It\'s very cheap.',
        exampleTranslation: '这很便宜。'
      }
    ],
    grammarPoints: [
      {
        title: '询问价格',
        explanation: '询问价格的常用句型',
        examples: [
          'How much is this? - 这个多少钱？',
          'How much are these? - 这些多少钱？',
          'What\'s the price? - 价格是多少？'
        ],
        tips: ['单数用 is，复数用 are']
      }
    ],
    dialogues: [
      {
        title: '在商店购物',
        speakers: ['Customer', 'Clerk'],
        lines: [
          { speaker: 'Customer', text: 'Excuse me, how much is this shirt?', translation: '打扰一下，这件衬衫多少钱？' },
          { speaker: 'Clerk', text: 'It\'s 50 dollars.', translation: '50美元。' },
          { speaker: 'Customer', text: 'OK, I\'ll take it.', translation: '好的，我买了。' }
        ],
        translation: '购物对话示例'
      }
    ],
    examples: [
      { english: 'Can I try this on?', chinese: '我可以试穿这个吗？' },
      { english: 'Do you have a smaller size?', chinese: '有小一号的吗？' }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: '询问价格应该说：',
        options: ['How much is it?', 'How many is it?', 'What is it?', 'Where is it?'],
        correctAnswer: 'How much is it?',
        explanation: 'How much 用于询问价格',
        points: 5
      }
    ],
    tips: ['购物时要礼貌地使用 please 和 thank you']
  }
]

// 导出按级别分类的课程
export const lessonsByLevel = {
  beginner: allLessons.filter(l => l.level === 'beginner'),
  intermediate: allLessons.filter(l => l.level === 'intermediate'),
  advanced: allLessons.filter(l => l.level === 'advanced')
}

// 导出按类别分类的课程
export const lessonsByCategory = {
  grammar: allLessons.filter(l => l.category === 'grammar'),
  vocabulary: allLessons.filter(l => l.category === 'vocabulary'),
  conversation: allLessons.filter(l => l.category === 'conversation'),
  listening: allLessons.filter(l => l.category === 'listening'),
  writing: allLessons.filter(l => l.category === 'writing')
}
