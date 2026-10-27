/**
 * Simple test for Memory Calculation Service
 */

import { MemoryCalculationService } from '../memory-calculation-service'

// Mock the word record service
jest.mock('../word-record-service', () => ({
  wordRecordService: {
    updateAllRetrievability: jest.fn(),
    getWordRecords: jest.fn(() => []),
    getStudySessions: jest.fn(() => [])
  }
}))

describe('Memory Calculation Service - Basic Tests', () => {
  let service: MemoryCalculationService

  beforeEach(() => {
    service = new MemoryCalculationService()
  })

  test('calculateBattery returns 100 for no words', () => {
    const battery = service.calculateBattery('test-user')
    expect(battery).toBe(100)
  })

  test('getLayerData returns correct structure', () => {
    const layerData = service.getLayerData('test-user', 7)
    expect(layerData).toHaveLength(7)
    expect(layerData[0]).toHaveProperty('date')
    expect(layerData[0]).toHaveProperty('permanent')
    expect(layerData[0]).toHaveProperty('familiar')
    expect(layerData[0]).toHaveProperty('new')
  })

  test('forecastReviews returns correct structure', () => {
    const forecast = service.forecastReviews('test-user', 7)
    expect(forecast).toHaveLength(7)
    expect(forecast[0]).toHaveProperty('date')
    expect(forecast[0]).toHaveProperty('count')
    expect(forecast[0]).toHaveProperty('isToday')
  })
})