import { ExerciseService } from '../exercise-service'
import { Exercise, ExerciseType, EnglishLevel, Answer } from '@/types'

describe('ExerciseService', () => {
  let service: ExerciseService

  beforeEach(() => {
    service = new ExerciseService()
  })

  describe('generateExercises', () => {
    it('should generate exercises with correct type and level', async () => {
      const exercises = await service.generateExercises(
        'multiple_choice',
        'beginner',
        3
      )

      expect(exercises).toHaveLength(3)
      exercises.forEach(exercise => {
        expect(exercise.type).toBe('multiple_choice')
        expect(exercise.id).toBeDefined()
        expect(exercise.question).toBeDefined()
      })
    })

    it('should generate different exercise types', async () => {
      const types: ExerciseType[] = ['fill_blank', 'speaking', 'writing']
      
      for (const type of types) {
        const exercises = await service.generateExercises(type, 'intermediate', 1)
        expect(exercises[0].type).toBe(type)
      }
    })
  })

  describe('calculateScore', () => {
    it('should calculate score based on accuracy', async () => {
      const answers: Answer[] = [
        { exerciseId: '1', userAnswer: 'a', isCorrect: true, timeSpent: 10 },
        { exerciseId: '2', userAnswer: 'b', isCorrect: true, timeSpent: 10 },
        { exerciseId: '3', userAnswer: 'c', isCorrect: false, timeSpent: 10 }
      ]

      const score = (service as any).calculateScore(answers, 30)
      
      // 2/3 correct = 66.7% accuracy
      // Base score = 66.7 * 0.7 = 46.7
      // Time bonus should add some points
      expect(score).toBeGreaterThan(40)
      expect(score).toBeLessThan(80)
    })

    it('should give perfect score for all correct answers', async () => {
      const answers: Answer[] = [
        { exerciseId: '1', userAnswer: 'a', isCorrect: true, timeSpent: 5 },
        { exerciseId: '2', userAnswer: 'b', isCorrect: true, timeSpent: 5 }
      ]

      const score = (service as any).calculateScore(answers, 10)
      
      // 100% accuracy should give high score
      expect(score).toBeGreaterThan(70)
    })
  })

  describe('checkAchievements', () => {
    it('should award perfect score achievement', () => {
      const session = {
        id: 'test',
        userId: 'user1',
        exercises: [
          { id: '1', type: 'multiple_choice' as ExerciseType, question: 'Q1', correctAnswer: 'A', explanation: '', difficulty: 1 }
        ],
        answers: [
          { exerciseId: '1', userAnswer: 'A', isCorrect: true, timeSpent: 10 }
        ],
        startTime: new Date(),
        currentIndex: 0,
        score: 100
      }

      const achievements = (service as any).checkAchievements(session, 1.0, 100)
      
      expect(achievements.length).toBeGreaterThan(0)
      expect(achievements.some((a: any) => a.type === 'perfect_score')).toBe(true)
    })

    it('should award listening achievement for good listening performance', () => {
      const session = {
        id: 'test',
        userId: 'user1',
        exercises: [
          { id: '1', type: 'listening' as ExerciseType, question: 'Q1', correctAnswer: 'A', explanation: '', difficulty: 1 }
        ],
        answers: [
          { exerciseId: '1', userAnswer: 'A', isCorrect: true, timeSpent: 10 }
        ],
        startTime: new Date(),
        currentIndex: 0,
        score: 90
      }

      const achievements = (service as any).checkAchievements(session, 0.9, 90)
      
      expect(achievements.some((a: any) => a.type === 'listening_champion')).toBe(true)
    })
  })

  describe('generateStarPosition', () => {
    it('should generate positions within valid range', () => {
      for (let i = 0; i < 10; i++) {
        const position = (service as any).generateStarPosition()
        
        expect(position.x).toBeGreaterThanOrEqual(0)
        expect(position.x).toBeLessThanOrEqual(100)
        expect(position.y).toBeGreaterThanOrEqual(0)
        expect(position.y).toBeLessThanOrEqual(100)
      }
    })
  })
})
