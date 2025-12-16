'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sprout, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { authAPI } from '@/lib/api'
import { validatePassword, isValidEmail } from '@/lib/utils'
import { EnglishLevel } from '@/types'

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  level: EnglishLevel
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  level?: string
  general?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    level: 'beginner'
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少2个字符'
    }

    // 验证邮箱
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        level: formData.level
      })

      if (response.success) {
        // 注册成功，显示欢迎动画并跳转
        router.push('/dashboard?welcome=true')
      } else {
        setErrors({ general: response.error?.message || '注册失败，请重试' })
      }
    } catch (error) {
      setErrors({ general: '网络错误，请检查网络连接' })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // 验证第一步的字段
      const stepOneErrors: FormErrors = {}
      if (!formData.username.trim()) stepOneErrors.username = '请输入用户名'
      if (!formData.email.trim()) stepOneErrors.email = '请输入邮箱'
      else if (!isValidEmail(formData.email)) stepOneErrors.email = '请输入有效的邮箱地址'
      
      if (Object.keys(stepOneErrors).length === 0) {
        setCurrentStep(2)
      } else {
        setErrors(stepOneErrors)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* 头部 */}
        <div className="text-center mb-8 animate-sprout-grow">
          <div className="flex items-center justify-center mb-4">
            <Sprout className="w-8 h-8 text-sprout-400 mr-2" />
            <Star className="w-6 h-6 text-star-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sprout-400 to-star-400 bg-clip-text text-transparent mb-2">
            开始学习之旅
          </h1>
          <p className="text-cosmos-300">创建你的专属星图，让每一次学习都闪耀如星辰</p>
        </div>

        {/* 进度指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              currentStep >= 1 ? 'bg-sprout-500 text-white' : 'bg-cosmos-700 text-cosmos-400'
            }`}>
              1
            </div>
            <div className={`w-12 h-1 rounded transition-all duration-300 ${
              currentStep >= 2 ? 'bg-sprout-500' : 'bg-cosmos-700'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              currentStep >= 2 ? 'bg-star-500 text-cosmos-900' : 'bg-cosmos-700 text-cosmos-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* 注册表单 */}
        <Card variant="cosmos" className="animate-sprout-grow [animation-delay:0.2s]">
          <CardHeader>
            <CardTitle className="text-center text-cosmos-200">
              {currentStep === 1 ? '基本信息' : '安全设置'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div className="space-y-4">
                    <Input
                      label="用户名"
                      type="text"
                      placeholder="请输入用户名"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      error={errors.username}
                    />

                    <Input
                      label="邮箱地址"
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-cosmos-200">
                        英语水平
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'beginner', label: '初学者', icon: '🌱' },
                          { value: 'intermediate', label: '中级', icon: '🌿' },
                          { value: 'advanced', label: '高级', icon: '🌟' }
                        ].map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => handleInputChange('level', level.value as EnglishLevel)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                              formData.level === level.value
                                ? 'border-sprout-400 bg-sprout-400/20 text-sprout-300'
                                : 'border-cosmos-600 bg-cosmos-800/50 text-cosmos-300 hover:border-cosmos-500'
                            }`}
                          >
                            <div className="text-lg mb-1">{level.icon}</div>
                            <div className="text-sm font-medium">{level.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={nextStep}
                    variant="sprout"
                    className="w-full"
                  >
                    下一步
                  </Button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-4">
                    <Input
                      label="密码"
                      type="password"
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      error={errors.password}
                      helperText="密码需包含大小写字母、数字，至少8位"
                    />

                    <Input
                      label="确认密码"
                      type="password"
                      placeholder="请再次输入密码"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      error={errors.confirmPassword}
                    />
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                      <p className="text-red-400 text-sm">{errors.general}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1"
                    >
                      上一步
                    </Button>
                    <Button
                      type="submit"
                      variant="star"
                      className="flex-1"
                      isLoading={isLoading}
                    >
                      创建账户
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 登录链接 */}
        <div className="text-center mt-6 animate-sprout-grow [animation-delay:0.4s]">
          <p className="text-cosmos-400">
            已有账户？{' '}
            <Link href="/auth/login" className="text-sprout-400 hover:text-sprout-300 transition-colors">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}