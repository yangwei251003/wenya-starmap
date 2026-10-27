/**
 * 完整的练习题库
 * 包含6种类型的练习题，每种都有丰富的内容
 */

import { Exercise, ExerciseType, EnglishLevel } from '@/types'

// 扩展Exercise接口以支持音频文本
interface ExerciseWithAudio extends Exercise {
  audioText?: string
}

// ==================== 选择题题库 ====================
export const multipleChoiceExercises: Exercise[] = [
  // 初级选择题
  {
    id: 'mc-1',
    type: 'multiple_choice',
    question: 'What is the past tense of "go"?',
    options: ['goed', 'went', 'gone', 'going'],
    correctAnswer: 'went',
    explanation: 'The past tense of "go" is "went". It is an irregular verb.',
    difficulty: 1
  },
  {
    id: 'mc-2',
    type: 'multiple_choice',
    question: 'Choose the correct article: I have ___ apple.',
    options: ['a', 'an', 'the', 'no article'],
    correctAnswer: 'an',
    explanation: 'Use "an" before words starting with a vowel sound. "Apple" starts with "a".',
    difficulty: 1
  },
  {
    id: 'mc-3',
    type: 'multiple_choice',
    question: 'Which word means "happy"?',
    options: ['sad', 'angry', 'joyful', 'tired'],
    correctAnswer: 'joyful',
    explanation: '"Joyful" is a synonym of "happy", meaning full of joy.',
    difficulty: 1
  },
  {
    id: 'mc-4',
    type: 'multiple_choice',
    question: 'What is the plural of "child"?',
    options: ['childs', 'children', 'childes', 'child'],
    correctAnswer: 'children',
    explanation: '"Children" is the irregular plural form of "child".',
    difficulty: 2
  },
  {
    id: 'mc-5',
    type: 'multiple_choice',
    question: 'Choose the correct preposition: I go ___ school by bus.',
    options: ['to', 'at', 'in', 'on'],
    correctAnswer: 'to',
    explanation: 'Use "to" to indicate direction or destination. "Go to school" is correct.',
    difficulty: 2
  },
  {
    id: 'mc-6',
    type: 'multiple_choice',
    question: 'Which sentence is correct?',
    options: [
      'She don\'t like coffee',
      'She doesn\'t likes coffee',
      'She doesn\'t like coffee',
      'She not like coffee'
    ],
    correctAnswer: 'She doesn\'t like coffee',
    explanation: 'Use "doesn\'t" (does not) with third person singular, followed by base verb.',
    difficulty: 2
  },
  {
    id: 'mc-7',
    type: 'multiple_choice',
    question: 'What does "break a leg" mean?',
    options: ['To injure yourself', 'Good luck', 'To run fast', 'To be tired'],
    correctAnswer: 'Good luck',
    explanation: '"Break a leg" is an idiom meaning "good luck", especially before a performance.',
    difficulty: 3
  },
  {
    id: 'mc-8',
    type: 'multiple_choice',
    question: 'Choose the correct form: If I ___ rich, I would travel the world.',
    options: ['am', 'was', 'were', 'be'],
    correctAnswer: 'were',
    explanation: 'In second conditional sentences, use "were" for all persons after "if".',
    difficulty: 3
  },
  {
    id: 'mc-9',
    type: 'multiple_choice',
    question: 'Which word is a synonym for "ubiquitous"?',
    options: ['rare', 'everywhere', 'beautiful', 'expensive'],
    correctAnswer: 'everywhere',
    explanation: '"Ubiquitous" means present, appearing, or found everywhere.',
    difficulty: 4
  },
  {
    id: 'mc-10',
    type: 'multiple_choice',
    question: 'Identify the sentence with correct subjunctive mood:',
    options: [
      'I wish I was taller',
      'I wish I were taller',
      'I wish I am taller',
      'I wish I be taller'
    ],
    correctAnswer: 'I wish I were taller',
    explanation: 'Use "were" (not "was") in subjunctive mood after "wish" for all persons.',
    difficulty: 4
  }
]

// ==================== 填空题题库 ====================
export const fillBlankExercises: Exercise[] = [
  {
    id: 'fb-1',
    type: 'fill_blank',
    question: 'I ___ to school every day. (go)',
    correctAnswer: 'go',
    explanation: 'Use the base form "go" for present simple with "I".',
    difficulty: 1
  },
  {
    id: 'fb-2',
    type: 'fill_blank',
    question: 'She ___ a teacher. (be)',
    correctAnswer: 'is',
    explanation: 'Use "is" as the present tense of "be" for third person singular.',
    difficulty: 1
  },
  {
    id: 'fb-3',
    type: 'fill_blank',
    question: 'They ___ playing football now. (be)',
    correctAnswer: 'are',
    explanation: 'Use "are" with "they" in present continuous tense.',
    difficulty: 1
  },
  {
    id: 'fb-4',
    type: 'fill_blank',
    question: 'I have ___ this movie before. (see)',
    correctAnswer: 'seen',
    explanation: 'Use past participle "seen" with present perfect "have".',
    difficulty: 2
  },
  {
    id: 'fb-5',
    type: 'fill_blank',
    question: 'He ___ to London last year. (go)',
    correctAnswer: 'went',
    explanation: 'Use past tense "went" for completed action in the past.',
    difficulty: 2
  },
  {
    id: 'fb-6',
    type: 'fill_blank',
    question: 'If it ___ tomorrow, we will stay home. (rain)',
    correctAnswer: 'rains',
    explanation: 'Use present simple in the "if" clause of first conditional.',
    difficulty: 2
  },
  {
    id: 'fb-7',
    type: 'fill_blank',
    question: 'The book ___ by millions of people. (read - passive)',
    correctAnswer: 'was read',
    explanation: 'Use passive voice "was read" to show the book received the action.',
    difficulty: 3
  },
  {
    id: 'fb-8',
    type: 'fill_blank',
    question: 'By next year, I ___ English for 5 years. (study)',
    correctAnswer: 'will have been studying',
    explanation: 'Use future perfect continuous for action continuing up to a future point.',
    difficulty: 4
  },
  {
    id: 'fb-9',
    type: 'fill_blank',
    question: 'I wish I ___ more time yesterday. (have)',
    correctAnswer: 'had had',
    explanation: 'Use past perfect "had had" after "wish" for past regrets.',
    difficulty: 4
  },
  {
    id: 'fb-10',
    type: 'fill_blank',
    question: 'The project ___ by the time you arrive. (complete - passive)',
    correctAnswer: 'will have been completed',
    explanation: 'Use future perfect passive for action completed before future time.',
    difficulty: 4
  }
]

// ==================== 听力练习题库 ====================
export const listeningExercises: ExerciseWithAudio[] = [
  {
    id: 'ls-1',
    type: 'listening',
    question: '🔊 Listen: "Hello, how are you?" - What is the speaker saying?',
    options: ['Greeting', 'Goodbye', 'Thank you', 'Sorry'],
    correctAnswer: 'Greeting',
    explanation: '"Hello, how are you?" is a common greeting in English.',
    difficulty: 1,
    audioText: 'Hello, how are you?'
  },
  {
    id: 'ls-2',
    type: 'listening',
    question: '🔊 Listen: "I have two cats and one dog." - How many pets?',
    options: ['Two', 'Three', 'Four', 'One'],
    correctAnswer: 'Three',
    explanation: 'Two cats plus one dog equals three pets total.',
    difficulty: 1,
    audioText: 'I have two cats and one dog.'
  },
  {
    id: 'ls-3',
    type: 'listening',
    question: '🔊 Listen: "The meeting is at 3 PM." - When is the meeting?',
    options: ['Morning', 'Afternoon', 'Evening', 'Night'],
    correctAnswer: 'Afternoon',
    explanation: '3 PM (15:00) is in the afternoon.',
    difficulty: 2,
    audioText: 'The meeting is at 3 PM.'
  },
  {
    id: 'ls-4',
    type: 'listening',
    question: '🔊 Listen: "I\'d like a coffee, please." - What does the person want?',
    options: ['Tea', 'Coffee', 'Water', 'Juice'],
    correctAnswer: 'Coffee',
    explanation: 'The person clearly states they would like a coffee.',
    difficulty: 2,
    audioText: 'I\'d like a coffee, please.'
  },
  {
    id: 'ls-5',
    type: 'listening',
    question: '🔊 Listen: "Turn left at the traffic light." - What direction?',
    options: ['Right', 'Left', 'Straight', 'Back'],
    correctAnswer: 'Left',
    explanation: 'The instruction is to turn left at the traffic light.',
    difficulty: 2,
    audioText: 'Turn left at the traffic light.'
  },
  {
    id: 'ls-6',
    type: 'listening',
    question: '🔊 Listen: "I\'ve been working here for five years." - How long?',
    options: ['Three years', 'Five years', 'Ten years', 'One year'],
    correctAnswer: 'Five years',
    explanation: 'The speaker has been working there for five years.',
    difficulty: 3,
    audioText: 'I\'ve been working here for five years.'
  },
  {
    id: 'ls-7',
    type: 'listening',
    question: '🔊 Listen: "Could you pass me the salt, please?" - What is requested?',
    options: ['Pepper', 'Salt', 'Sugar', 'Water'],
    correctAnswer: 'Salt',
    explanation: 'The speaker politely asks for the salt to be passed.',
    difficulty: 2,
    audioText: 'Could you pass me the salt, please?'
  },
  {
    id: 'ls-8',
    type: 'listening',
    question: '🔊 Listen: "The train departs at quarter past eight." - What time?',
    options: ['8:00', '8:15', '8:30', '8:45'],
    correctAnswer: '8:15',
    explanation: '"Quarter past eight" means 15 minutes after 8, which is 8:15.',
    difficulty: 3,
    audioText: 'The train departs at quarter past eight.'
  },
  {
    id: 'ls-9',
    type: 'listening',
    question: '🔊 Listen: "I wouldn\'t have done that if I were you." - What mood?',
    options: ['Indicative', 'Imperative', 'Subjunctive', 'Interrogative'],
    correctAnswer: 'Subjunctive',
    explanation: 'This uses subjunctive mood with "if I were you" for hypothetical advice.',
    difficulty: 4,
    audioText: 'I wouldn\'t have done that if I were you.'
  },
  {
    id: 'ls-10',
    type: 'listening',
    question: '🔊 Listen: "Had I known earlier, I would have helped." - What tense?',
    options: ['Past simple', 'Past perfect', 'Present perfect', 'Future perfect'],
    correctAnswer: 'Past perfect',
    explanation: 'This uses past perfect "had known" in a third conditional sentence.',
    difficulty: 4,
    audioText: 'Had I known earlier, I would have helped.'
  }
]

// ==================== 口语练习题库 ====================
export const speakingExercises: Exercise[] = [
  {
    id: 'sp-1',
    type: 'speaking',
    question: '🎤 Say: "Hello, my name is [your name]."',
    correctAnswer: 'Hello, my name is',
    explanation: 'Practice introducing yourself clearly and confidently.',
    difficulty: 1
  },
  {
    id: 'sp-2',
    type: 'speaking',
    question: '🎤 Say: "I am from [your country]."',
    correctAnswer: 'I am from',
    explanation: 'Practice stating where you are from.',
    difficulty: 1
  },
  {
    id: 'sp-3',
    type: 'speaking',
    question: '🎤 Say: "Nice to meet you!"',
    correctAnswer: 'Nice to meet you',
    explanation: 'Practice this common greeting phrase.',
    difficulty: 1
  },
  {
    id: 'sp-4',
    type: 'speaking',
    question: '🎤 Answer: "What is your favorite food?"',
    correctAnswer: 'My favorite food is',
    explanation: 'Practice answering questions about preferences.',
    difficulty: 2
  },
  {
    id: 'sp-5',
    type: 'speaking',
    question: '🎤 Describe: "What do you do in your free time?"',
    correctAnswer: 'In my free time, I',
    explanation: 'Practice describing your hobbies and activities.',
    difficulty: 2
  },
  {
    id: 'sp-6',
    type: 'speaking',
    question: '🎤 Say: "Could you please repeat that?"',
    correctAnswer: 'Could you please repeat that',
    explanation: 'Practice asking for clarification politely.',
    difficulty: 2
  },
  {
    id: 'sp-7',
    type: 'speaking',
    question: '🎤 Explain: "Why do you want to learn English?"',
    correctAnswer: 'I want to learn English because',
    explanation: 'Practice explaining your motivations.',
    difficulty: 3
  },
  {
    id: 'sp-8',
    type: 'speaking',
    question: '🎤 Describe: "Tell me about your hometown."',
    correctAnswer: 'My hometown is',
    explanation: 'Practice describing places in detail.',
    difficulty: 3
  },
  {
    id: 'sp-9',
    type: 'speaking',
    question: '🎤 Discuss: "What are the advantages of learning languages?"',
    correctAnswer: 'The advantages of learning languages',
    explanation: 'Practice discussing abstract topics.',
    difficulty: 4
  },
  {
    id: 'sp-10',
    type: 'speaking',
    question: '🎤 Debate: "Is technology making us more or less social?"',
    correctAnswer: 'I believe that technology',
    explanation: 'Practice expressing and defending opinions.',
    difficulty: 4
  }
]

// ==================== 阅读理解题库 ====================
export const readingExercises: Exercise[] = [
  {
    id: 'rd-1',
    type: 'reading_comprehension',
    question: 'Read: "Tom is a student. He likes reading books." - What does Tom like?',
    options: ['Playing games', 'Reading books', 'Watching TV', 'Playing sports'],
    correctAnswer: 'Reading books',
    explanation: 'The text clearly states "He likes reading books."',
    difficulty: 1
  },
  {
    id: 'rd-2',
    type: 'reading_comprehension',
    question: 'Read: "The cat is sleeping on the sofa." - Where is the cat?',
    options: ['On the bed', 'On the sofa', 'On the floor', 'On the table'],
    correctAnswer: 'On the sofa',
    explanation: 'The text says the cat is sleeping on the sofa.',
    difficulty: 1
  },
  {
    id: 'rd-3',
    type: 'reading_comprehension',
    question: 'Read: "Mary goes to school at 8 AM every day." - When does Mary go to school?',
    options: ['7 AM', '8 AM', '9 AM', '10 AM'],
    correctAnswer: '8 AM',
    explanation: 'Mary goes to school at 8 AM according to the text.',
    difficulty: 1
  },
  {
    id: 'rd-4',
    type: 'reading_comprehension',
    question: 'Read: "John loves pizza, but he doesn\'t like vegetables." - What doesn\'t John like?',
    options: ['Pizza', 'Vegetables', 'Fruit', 'Meat'],
    correctAnswer: 'Vegetables',
    explanation: 'The text states John doesn\'t like vegetables.',
    difficulty: 2
  },
  {
    id: 'rd-5',
    type: 'reading_comprehension',
    question: 'Read: "The weather was sunny yesterday, so we went to the beach." - Why did they go to the beach?',
    options: ['It was rainy', 'It was sunny', 'It was cold', 'It was windy'],
    correctAnswer: 'It was sunny',
    explanation: 'They went to the beach because the weather was sunny.',
    difficulty: 2
  },
  {
    id: 'rd-6',
    type: 'reading_comprehension',
    question: 'Read: "Despite the rain, the match continued." - What happened?',
    options: ['Match was cancelled', 'Match continued', 'Match was postponed', 'Match ended early'],
    correctAnswer: 'Match continued',
    explanation: '"Despite" indicates contrast - the match continued even though it rained.',
    difficulty: 3
  },
  {
    id: 'rd-7',
    type: 'reading_comprehension',
    question: 'Read: "The company\'s profits have increased significantly this quarter." - What happened to profits?',
    options: ['Decreased', 'Stayed same', 'Increased', 'Disappeared'],
    correctAnswer: 'Increased',
    explanation: 'The text states profits have increased significantly.',
    difficulty: 3
  },
  {
    id: 'rd-8',
    type: 'reading_comprehension',
    question: 'Read: "The author\'s use of metaphor enhances the narrative\'s emotional depth." - What literary device?',
    options: ['Simile', 'Metaphor', 'Alliteration', 'Personification'],
    correctAnswer: 'Metaphor',
    explanation: 'The text explicitly mentions the use of metaphor.',
    difficulty: 4
  },
  {
    id: 'rd-9',
    type: 'reading_comprehension',
    question: 'Read: "The protagonist\'s internal conflict drives the plot forward." - What drives the plot?',
    options: ['External events', 'Internal conflict', 'Other characters', 'Setting'],
    correctAnswer: 'Internal conflict',
    explanation: 'The protagonist\'s internal conflict is stated as the driving force.',
    difficulty: 4
  },
  {
    id: 'rd-10',
    type: 'reading_comprehension',
    question: 'Read: "The study\'s methodology was rigorous, yet the conclusions remain contentious." - What about conclusions?',
    options: ['Accepted', 'Contentious', 'Proven', 'Ignored'],
    correctAnswer: 'Contentious',
    explanation: '"Contentious" means the conclusions are still debated or controversial.',
    difficulty: 4
  }
]

// ==================== 写作练习题库 ====================
export const writingExercises: Exercise[] = [
  {
    id: 'wr-1',
    type: 'writing',
    question: '✍️ Translate to English: 我喜欢苹果。',
    correctAnswer: 'I like apples',
    explanation: 'Simple present tense: I like apples.',
    difficulty: 1
  },
  {
    id: 'wr-2',
    type: 'writing',
    question: '✍️ Translate to English: 他是一名学生。',
    correctAnswer: 'He is a student',
    explanation: 'Use "is" with "he" and article "a" before "student".',
    difficulty: 1
  },
  {
    id: 'wr-3',
    type: 'writing',
    question: '✍️ Complete: My favorite color is ___.',
    correctAnswer: 'blue',
    explanation: 'Write any color name in English (e.g., blue, red, green).',
    difficulty: 1
  },
  {
    id: 'wr-4',
    type: 'writing',
    question: '✍️ Translate: 我昨天去了公园。',
    correctAnswer: 'I went to the park yesterday',
    explanation: 'Past tense: I went to the park yesterday.',
    difficulty: 2
  },
  {
    id: 'wr-5',
    type: 'writing',
    question: '✍️ Write a sentence using "because".',
    correctAnswer: 'I stayed home because it was raining',
    explanation: 'Use "because" to show reason or cause.',
    difficulty: 2
  },
  {
    id: 'wr-6',
    type: 'writing',
    question: '✍️ Translate: 如果明天下雨，我会待在家里。',
    correctAnswer: 'If it rains tomorrow, I will stay home',
    explanation: 'First conditional: If + present simple, will + base verb.',
    difficulty: 3
  },
  {
    id: 'wr-7',
    type: 'writing',
    question: '✍️ Write a sentence using "although".',
    correctAnswer: 'Although it was cold, we went outside',
    explanation: 'Use "although" to show contrast between two clauses.',
    difficulty: 3
  },
  {
    id: 'wr-8',
    type: 'writing',
    question: '✍️ Write a formal email opening.',
    correctAnswer: 'Dear Sir/Madam',
    explanation: 'Formal emails start with "Dear Sir/Madam" or "Dear [Name]".',
    difficulty: 3
  },
  {
    id: 'wr-9',
    type: 'writing',
    question: '✍️ Write a thesis statement about technology.',
    correctAnswer: 'Technology has revolutionized modern communication',
    explanation: 'A thesis statement presents the main argument clearly.',
    difficulty: 4
  },
  {
    id: 'wr-10',
    type: 'writing',
    question: '✍️ Write a complex sentence with a relative clause.',
    correctAnswer: 'The book that I read yesterday was fascinating',
    explanation: 'Use relative pronouns (that, which, who) to add information.',
    difficulty: 4
  }
]

// ==================== 导出所有练习题 ====================
export const allExercises = {
  multiple_choice: multipleChoiceExercises,
  fill_blank: fillBlankExercises,
  listening: listeningExercises,
  speaking: speakingExercises,
  reading_comprehension: readingExercises,
  writing: writingExercises
}

// 按难度获取练习题
export function getExercisesByDifficulty(
  type: ExerciseType,
  difficulty: number,
  count: number = 5
): Exercise[] {
  const exercises = allExercises[type] || []
  const filtered = exercises.filter(ex => ex.difficulty === difficulty)
  return filtered.slice(0, count)
}

// 按级别获取练习题
export function getExercisesByLevel(
  type: ExerciseType,
  level: EnglishLevel,
  count: number = 5
): Exercise[] {
  const difficultyMap: Record<EnglishLevel, number[]> = {
    beginner: [1, 2],
    intermediate: [2, 3],
    advanced: [3, 4]
  }

  const exercises = allExercises[type] || []
  const difficulties = difficultyMap[level] || [2]
  const filtered = exercises.filter(ex => difficulties.includes(ex.difficulty))
  
  // 随机打乱并返回指定数量
  return filtered.sort(() => Math.random() - 0.5).slice(0, count)
}

// 获取随机练习题
export function getRandomExercises(
  type: ExerciseType,
  count: number = 5
): Exercise[] {
  const exercises = allExercises[type] || []
  return exercises.sort(() => Math.random() - 0.5).slice(0, count)
}
