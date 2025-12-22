/**
 * 单词数据库 - 包含CET4/CET6核心词汇
 */

import { Word } from '@/types'

export const wordsData: Word[] = [
  // ==================== CET4 基础词汇 ====================
  {
    id: 'word-001',
    word: 'abandon',
    meaning: 'v. 放弃；抛弃；遗弃',
    phonetic: '/əˈbændən/',
    example: 'He abandoned his wife and children.',
    exampleCn: '他抛弃了妻子和孩子。',
    chunk: 'abandon oneself to',
    confusingWords: ['desert', 'forsake', 'quit'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-002',
    word: 'ability',
    meaning: 'n. 能力；才能；本领',
    phonetic: '/əˈbɪləti/',
    example: 'She has the ability to solve complex problems.',
    exampleCn: '她有解决复杂问题的能力。',
    chunk: 'have the ability to',
    confusingWords: ['capability', 'capacity', 'skill'],
    tags: ['CET4', '基础']
  },
  {
    id: 'word-003',
    word: 'absolute',
    meaning: 'adj. 绝对的；完全的；专制的',
    phonetic: '/ˈæbsəluːt/',
    example: 'I have absolute confidence in her.',
    exampleCn: '我对她有绝对的信心。',
    chunk: 'absolute power',
    confusingWords: ['complete', 'total', 'utter'],
    tags: ['CET4']
  },
  {
    id: 'word-004',
    word: 'absorb',
    meaning: 'v. 吸收；吸引；使全神贯注',
    phonetic: '/əbˈzɔːrb/',
    example: 'Plants absorb carbon dioxide.',
    exampleCn: '植物吸收二氧化碳。',
    chunk: 'be absorbed in',
    confusingWords: ['attract', 'engage', 'occupy'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-005',
    word: 'abstract',
    meaning: 'adj. 抽象的 n. 摘要',
    phonetic: '/ˈæbstrækt/',
    example: 'Abstract art is hard to understand.',
    exampleCn: '抽象艺术很难理解。',
    chunk: 'abstract concept',
    confusingWords: ['theoretical', 'conceptual'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-006',
    word: 'abundant',
    meaning: 'adj. 丰富的；充裕的；大量的',
    phonetic: '/əˈbʌndənt/',
    example: 'The country has abundant natural resources.',
    exampleCn: '这个国家有丰富的自然资源。',
    chunk: 'abundant in',
    confusingWords: ['plentiful', 'ample', 'rich'],
    tags: ['CET4']
  },
  {
    id: 'word-007',
    word: 'accelerate',
    meaning: 'v. 加速；促进；增加',
    phonetic: '/əkˈseləreɪt/',
    example: 'The car accelerated rapidly.',
    exampleCn: '汽车迅速加速。',
    chunk: 'accelerate the process',
    confusingWords: ['speed up', 'quicken', 'hasten'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-008',
    word: 'access',
    meaning: 'n. 通道；入口 v. 访问；存取',
    phonetic: '/ˈækses/',
    example: 'Students have access to the library.',
    exampleCn: '学生可以使用图书馆。',
    chunk: 'have access to',
    confusingWords: ['approach', 'entry', 'entrance'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-009',
    word: 'accommodate',
    meaning: 'v. 容纳；提供住宿；适应',
    phonetic: '/əˈkɒmədeɪt/',
    example: 'The hotel can accommodate 500 guests.',
    exampleCn: '这家酒店可以容纳500位客人。',
    chunk: 'accommodate to',
    confusingWords: ['adapt', 'adjust', 'house'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-010',
    word: 'accomplish',
    meaning: 'v. 完成；实现；达到',
    phonetic: '/əˈkʌmplɪʃ/',
    example: 'She accomplished her goal.',
    exampleCn: '她实现了她的目标。',
    chunk: 'accomplish a task',
    confusingWords: ['achieve', 'complete', 'fulfill'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-011',
    word: 'accurate',
    meaning: 'adj. 准确的；精确的；正确的',
    phonetic: '/ˈækjərət/',
    example: 'The report is accurate.',
    exampleCn: '这份报告是准确的。',
    chunk: 'accurate information',
    confusingWords: ['precise', 'exact', 'correct'],
    tags: ['CET4']
  },
  {
    id: 'word-012',
    word: 'achieve',
    meaning: 'v. 达到；完成；获得',
    phonetic: '/əˈtʃiːv/',
    example: 'He achieved great success.',
    exampleCn: '他取得了巨大的成功。',
    chunk: 'achieve success',
    confusingWords: ['accomplish', 'attain', 'reach'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-013',
    word: 'acknowledge',
    meaning: 'v. 承认；确认；感谢',
    phonetic: '/əkˈnɒlɪdʒ/',
    example: 'He acknowledged his mistake.',
    exampleCn: '他承认了自己的错误。',
    chunk: 'acknowledge receipt',
    confusingWords: ['admit', 'recognize', 'accept'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-014',
    word: 'acquire',
    meaning: 'v. 获得；取得；学到',
    phonetic: '/əˈkwaɪər/',
    example: 'She acquired a new skill.',
    exampleCn: '她学到了一项新技能。',
    chunk: 'acquire knowledge',
    confusingWords: ['obtain', 'gain', 'get'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-015',
    word: 'adapt',
    meaning: 'v. 适应；改编；调整',
    phonetic: '/əˈdæpt/',
    example: 'You must adapt to the new environment.',
    exampleCn: '你必须适应新环境。',
    chunk: 'adapt to',
    confusingWords: ['adjust', 'accommodate', 'modify'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-016',
    word: 'adequate',
    meaning: 'adj. 足够的；适当的；胜任的',
    phonetic: '/ˈædɪkwət/',
    example: 'The food supply is adequate.',
    exampleCn: '食物供应是充足的。',
    chunk: 'adequate for',
    confusingWords: ['sufficient', 'enough', 'satisfactory'],
    tags: ['CET4']
  },
  {
    id: 'word-017',
    word: 'adjust',
    meaning: 'v. 调整；适应；校准',
    phonetic: '/əˈdʒʌst/',
    example: 'Please adjust the volume.',
    exampleCn: '请调整音量。',
    chunk: 'adjust to',
    confusingWords: ['adapt', 'modify', 'regulate'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-018',
    word: 'admire',
    meaning: 'v. 钦佩；赞美；欣赏',
    phonetic: '/ədˈmaɪər/',
    example: 'I admire her courage.',
    exampleCn: '我钦佩她的勇气。',
    chunk: 'admire sb for',
    confusingWords: ['appreciate', 'respect', 'esteem'],
    tags: ['CET4']
  },
  {
    id: 'word-019',
    word: 'admit',
    meaning: 'v. 承认；准许进入；容纳',
    phonetic: '/ədˈmɪt/',
    example: 'He admitted his fault.',
    exampleCn: '他承认了自己的错误。',
    chunk: 'admit to',
    confusingWords: ['acknowledge', 'confess', 'allow'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-020',
    word: 'adopt',
    meaning: 'v. 采用；收养；正式通过',
    phonetic: '/əˈdɒpt/',
    example: 'They adopted a new policy.',
    exampleCn: '他们采用了新政策。',
    chunk: 'adopt a method',
    confusingWords: ['adapt', 'embrace', 'take up'],
    tags: ['CET4', '高频']
  },
  // 继续添加更多单词
  {
    id: 'word-021',
    word: 'advance',
    meaning: 'v. 前进；进步 n. 前进；进展',
    phonetic: '/ədˈvɑːns/',
    example: 'Technology continues to advance.',
    exampleCn: '科技持续进步。',
    chunk: 'in advance',
    confusingWords: ['progress', 'proceed', 'move forward'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-022',
    word: 'advantage',
    meaning: 'n. 优势；利益；好处',
    phonetic: '/ədˈvɑːntɪdʒ/',
    example: 'What are the advantages of this plan?',
    exampleCn: '这个计划有什么优势？',
    chunk: 'take advantage of',
    confusingWords: ['benefit', 'merit', 'profit'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-023',
    word: 'adventure',
    meaning: 'n. 冒险；奇遇',
    phonetic: '/ədˈventʃər/',
    example: 'Life is an adventure.',
    exampleCn: '生活就是一场冒险。',
    chunk: 'adventure story',
    confusingWords: ['venture', 'expedition'],
    tags: ['CET4']
  },
  {
    id: 'word-024',
    word: 'advertise',
    meaning: 'v. 做广告；宣传',
    phonetic: '/ˈædvətaɪz/',
    example: 'They advertise on TV.',
    exampleCn: '他们在电视上做广告。',
    chunk: 'advertise for',
    confusingWords: ['promote', 'publicize'],
    tags: ['CET4']
  },
  {
    id: 'word-025',
    word: 'advice',
    meaning: 'n. 建议；忠告',
    phonetic: '/ədˈvaɪs/',
    example: 'Can you give me some advice?',
    exampleCn: '你能给我一些建议吗？',
    chunk: 'take advice',
    confusingWords: ['advise', 'suggestion', 'counsel'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-026',
    word: 'affect',
    meaning: 'v. 影响；感动',
    phonetic: '/əˈfekt/',
    example: 'The weather affects my mood.',
    exampleCn: '天气影响我的心情。',
    chunk: 'be affected by',
    confusingWords: ['effect', 'influence', 'impact'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-027',
    word: 'afford',
    meaning: 'v. 负担得起；提供',
    phonetic: '/əˈfɔːrd/',
    example: 'I cannot afford a new car.',
    exampleCn: '我买不起新车。',
    chunk: 'can afford to',
    confusingWords: ['provide', 'supply'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-028',
    word: 'afraid',
    meaning: 'adj. 害怕的；担心的',
    phonetic: '/əˈfreɪd/',
    example: 'I am afraid of heights.',
    exampleCn: '我恐高。',
    chunk: 'be afraid of',
    confusingWords: ['scared', 'frightened', 'fearful'],
    tags: ['CET4', '基础']
  },
  {
    id: 'word-029',
    word: 'agent',
    meaning: 'n. 代理人；代理商；特工',
    phonetic: '/ˈeɪdʒənt/',
    example: 'He is a travel agent.',
    exampleCn: '他是一名旅行社代理。',
    chunk: 'secret agent',
    confusingWords: ['representative', 'broker'],
    tags: ['CET4']
  },
  {
    id: 'word-030',
    word: 'aggressive',
    meaning: 'adj. 侵略的；好斗的；有进取心的',
    phonetic: '/əˈɡresɪv/',
    example: 'He has an aggressive personality.',
    exampleCn: '他性格好斗。',
    chunk: 'aggressive behavior',
    confusingWords: ['hostile', 'assertive', 'forceful'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-031',
    word: 'agree',
    meaning: 'v. 同意；赞成；一致',
    phonetic: '/əˈɡriː/',
    example: 'I agree with you.',
    exampleCn: '我同意你的看法。',
    chunk: 'agree with',
    confusingWords: ['consent', 'approve', 'accept'],
    tags: ['CET4', '基础', '高频']
  },
  {
    id: 'word-032',
    word: 'agriculture',
    meaning: 'n. 农业；农学',
    phonetic: '/ˈæɡrɪkʌltʃər/',
    example: 'Agriculture is important for the economy.',
    exampleCn: '农业对经济很重要。',
    chunk: 'modern agriculture',
    confusingWords: ['farming', 'cultivation'],
    tags: ['CET4']
  },
  {
    id: 'word-033',
    word: 'ahead',
    meaning: 'adv. 向前；在前面',
    phonetic: '/əˈhed/',
    example: 'Go straight ahead.',
    exampleCn: '一直往前走。',
    chunk: 'ahead of',
    confusingWords: ['forward', 'onward'],
    tags: ['CET4', '基础']
  },
  {
    id: 'word-034',
    word: 'aim',
    meaning: 'v. 瞄准；目标 n. 目的；目标',
    phonetic: '/eɪm/',
    example: 'What is your aim in life?',
    exampleCn: '你的人生目标是什么？',
    chunk: 'aim at',
    confusingWords: ['goal', 'target', 'objective'],
    tags: ['CET4', '高频']
  },
  {
    id: 'word-035',
    word: 'aircraft',
    meaning: 'n. 飞机；航空器',
    phonetic: '/ˈeəkrɑːft/',
    example: 'The aircraft landed safely.',
    exampleCn: '飞机安全着陆。',
    chunk: 'military aircraft',
    confusingWords: ['airplane', 'plane'],
    tags: ['CET4']
  },
  {
    id: 'word-036',
    word: 'alarm',
    meaning: 'n. 警报；惊恐 v. 使惊恐',
    phonetic: '/əˈlɑːrm/',
    example: 'The alarm went off at 6 AM.',
    exampleCn: '闹钟在早上6点响了。',
    chunk: 'alarm clock',
    confusingWords: ['alert', 'warning'],
    tags: ['CET4']
  },
  {
    id: 'word-037',
    word: 'alcohol',
    meaning: 'n. 酒精；含酒精的饮料',
    phonetic: '/ˈælkəhɒl/',
    example: 'He does not drink alcohol.',
    exampleCn: '他不喝酒。',
    chunk: 'alcohol abuse',
    confusingWords: ['liquor', 'spirits'],
    tags: ['CET4']
  },
  {
    id: 'word-038',
    word: 'alert',
    meaning: 'adj. 警觉的 v. 警告 n. 警报',
    phonetic: '/əˈlɜːrt/',
    example: 'Stay alert while driving.',
    exampleCn: '开车时保持警觉。',
    chunk: 'be alert to',
    confusingWords: ['vigilant', 'watchful', 'alarm'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-039',
    word: 'alien',
    meaning: 'n. 外星人；外国人 adj. 外国的',
    phonetic: '/ˈeɪliən/',
    example: 'The movie is about aliens.',
    exampleCn: '这部电影是关于外星人的。',
    chunk: 'alien species',
    confusingWords: ['foreigner', 'stranger'],
    tags: ['CET4', 'CET6']
  },
  {
    id: 'word-040',
    word: 'alike',
    meaning: 'adj. 相似的 adv. 同样地',
    phonetic: '/əˈlaɪk/',
    example: 'The twins look alike.',
    exampleCn: '这对双胞胎看起来很像。',
    chunk: 'look alike',
    confusingWords: ['similar', 'same', 'identical'],
    tags: ['CET4']
  }
]

// 按标签获取单词
export function getWordsByTag(tag: string): Word[] {
  return wordsData.filter(w => w.tags.includes(tag))
}

// 获取所有单词
export function getAllWords(): Word[] {
  return wordsData
}

// 获取单词详情
export function getWordById(id: string): Word | undefined {
  return wordsData.find(w => w.id === id)
}

// 搜索单词
export function searchWords(query: string): Word[] {
  const lowerQuery = query.toLowerCase()
  return wordsData.filter(w => 
    w.word.toLowerCase().includes(lowerQuery) ||
    w.meaning.includes(query)
  )
}

// 获取随机单词
export function getRandomWords(count: number): Word[] {
  const shuffled = [...wordsData].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
