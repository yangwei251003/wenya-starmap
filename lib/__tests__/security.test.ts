// 安全工具测试

import {
  DataMasking,
  InputValidator,
  RateLimiter,
  SensitiveDataType
} from '../security'

describe('DataMasking', () => {
  describe('maskEmail', () => {
    it('should mask email addresses correctly', () => {
      expect(DataMasking.maskEmail('user@example.com')).toBe('u***r@example.com')
      expect(DataMasking.maskEmail('test@test.com')).toBe('t***t@test.com')
    })

    it('should handle short usernames', () => {
      expect(DataMasking.maskEmail('ab@test.com')).toBe('***@test.com')
    })

    it('should handle invalid emails', () => {
      expect(DataMasking.maskEmail('invalid')).toBe('***')
      expect(DataMasking.maskEmail('')).toBe('***')
    })
  })

  describe('maskPassword', () => {
    it('should completely hide passwords', () => {
      expect(DataMasking.maskPassword()).toBe('********')
    })
  })

  describe('maskAPIKey', () => {
    it('should mask API keys correctly', () => {
      const key = 'sk-1234567890abcdef'
      const masked = DataMasking.maskAPIKey(key)
      expect(masked).toBe('sk-1***cdef')
    })

    it('should handle short keys', () => {
      expect(DataMasking.maskAPIKey('short')).toBe('***')
    })
  })

  describe('maskPhone', () => {
    it('should mask phone numbers correctly', () => {
      expect(DataMasking.maskPhone('13812345678')).toBe('138****5678')
      expect(DataMasking.maskPhone('1234567')).toBe('123****567')
    })

    it('should handle short numbers', () => {
      expect(DataMasking.maskPhone('123')).toBe('***')
    })
  })

  describe('maskObject', () => {
    it('should mask sensitive fields in objects', () => {
      const obj = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret123',
        apiKey: 'sk-1234567890abcdef'
      }

      const masked = DataMasking.maskObject(obj, [
        { field: 'email', type: SensitiveDataType.EMAIL },
        { field: 'password', type: SensitiveDataType.PASSWORD },
        { field: 'apiKey', type: SensitiveDataType.API_KEY }
      ])

      expect(masked.username).toBe('testuser')
      expect(masked.email).toBe('t***t@example.com')
      expect(masked.password).toBe('********')
      expect(masked.apiKey).toBe('sk-1***cdef')
    })
  })
})

describe('InputValidator', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(InputValidator.isValidEmail('test@example.com')).toBe(true)
      expect(InputValidator.isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(InputValidator.isValidEmail('invalid')).toBe(false)
      expect(InputValidator.isValidEmail('test@')).toBe(false)
      expect(InputValidator.isValidEmail('@example.com')).toBe(false)
      expect(InputValidator.isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = InputValidator.isValidPassword('Test1234')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short passwords', () => {
      const result = InputValidator.isValidPassword('Test12')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码长度至少为8个字符')
    })

    it('should require lowercase letters', () => {
      const result = InputValidator.isValidPassword('TEST1234')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含小写字母')
    })

    it('should require uppercase letters', () => {
      const result = InputValidator.isValidPassword('test1234')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含大写字母')
    })

    it('should require numbers', () => {
      const result = InputValidator.isValidPassword('TestTest')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码必须包含数字')
    })
  })

  describe('isValidUsername', () => {
    it('should validate correct usernames', () => {
      const result = InputValidator.isValidUsername('test_user')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short usernames', () => {
      const result = InputValidator.isValidUsername('ab')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('用户名长度必须在3-20个字符之间')
    })

    it('should reject long usernames', () => {
      const result = InputValidator.isValidUsername('a'.repeat(21))
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('用户名长度必须在3-20个字符之间')
    })

    it('should reject invalid characters', () => {
      const result = InputValidator.isValidUsername('test-user')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('用户名只能包含字母、数字和下划线')
    })
  })

  describe('sanitizeHTML', () => {
    it('should escape HTML tags', () => {
      const input = '<script>alert("xss")</script>'
      const sanitized = InputValidator.sanitizeHTML(input)
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })

    it('should escape quotes', () => {
      const input = 'test "quoted" text'
      const sanitized = InputValidator.sanitizeHTML(input)
      expect(sanitized).toContain('&quot;')
    })
  })

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      const input = '  test  '
      const sanitized = InputValidator.sanitizeInput(input)
      expect(sanitized).toBe('test')
    })

    it('should limit length', () => {
      const input = 'a'.repeat(2000)
      const sanitized = InputValidator.sanitizeInput(input, 100)
      expect(sanitized.length).toBeLessThanOrEqual(100)
    })

    it('should remove control characters', () => {
      const input = 'test\x00\x01\x1Ftext'
      const sanitized = InputValidator.sanitizeInput(input)
      expect(sanitized).toBe('testtext')
    })
  })
})

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1) // 3 requests per second
  })

  it('should allow requests within limit', () => {
    expect(rateLimiter.allowRequest('user1')).toBe(true)
    expect(rateLimiter.allowRequest('user1')).toBe(true)
    expect(rateLimiter.allowRequest('user1')).toBe(true)
  })

  it('should block requests exceeding limit', () => {
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    
    expect(rateLimiter.allowRequest('user1')).toBe(false)
  })

  it('should track different users separately', () => {
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    
    expect(rateLimiter.allowRequest('user2')).toBe(true)
  })

  it('should reset user limits', () => {
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    
    rateLimiter.reset('user1')
    
    expect(rateLimiter.allowRequest('user1')).toBe(true)
  })

  it('should allow requests after time window expires', async () => {
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user1')
    
    expect(rateLimiter.allowRequest('user1')).toBe(false)
    
    // Wait for time window to expire
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    expect(rateLimiter.allowRequest('user1')).toBe(true)
  })

  it('should clear all limits', () => {
    rateLimiter.allowRequest('user1')
    rateLimiter.allowRequest('user2')
    
    rateLimiter.clearAll()
    
    expect(rateLimiter.allowRequest('user1')).toBe(true)
    expect(rateLimiter.allowRequest('user2')).toBe(true)
  })
})
