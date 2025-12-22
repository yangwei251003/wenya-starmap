// 语音服务 - 文本转语音功能

export interface SpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
}

export class SpeechService {
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isSupported: boolean = false

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
      this.isSupported = true
      this.loadVoices()
    }
  }

  /**
   * 加载可用的语音
   */
  private loadVoices() {
    if (!this.synthesis) return

    const updateVoices = () => {
      this.voices = this.synthesis!.getVoices()
    }

    updateVoices()
    
    // 某些浏览器需要异步加载语音
    if (this.voices.length === 0) {
      this.synthesis.onvoiceschanged = updateVoices
    }
  }

  /**
   * 获取最佳英语语音
   */
  private getBestEnglishVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null

    // 优先选择英语语音
    const englishVoices = this.voices.filter(voice => 
      voice.lang.startsWith('en-') || voice.lang === 'en'
    )

    if (englishVoices.length > 0) {
      // 优先选择美式英语
      const usVoice = englishVoices.find(voice => voice.lang === 'en-US')
      if (usVoice) return usVoice

      // 其次选择英式英语
      const gbVoice = englishVoices.find(voice => voice.lang === 'en-GB')
      if (gbVoice) return gbVoice

      // 返回第一个英语语音
      return englishVoices[0]
    }

    // 如果没有英语语音，返回默认语音
    return this.voices[0] || null
  }

  /**
   * 朗读文本
   * @param text - 要朗读的文本
   * @param options - 语音选项
   * @returns Promise<void>
   */
  speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        reject(new Error('语音合成不支持'))
        return
      }

      // 停止当前播放
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // 设置语音参数
      const voice = this.getBestEnglishVoice()
      if (voice) {
        utterance.voice = voice
      }

      utterance.lang = options.lang || 'en-US'
      utterance.rate = options.rate || 0.8 // 稍慢一点，便于学习
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      // 事件处理
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`语音播放失败: ${event.error}`))

      this.synthesis.speak(utterance)
    })
  }

  /**
   * 停止语音播放
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  /**
   * 暂停语音播放
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause()
    }
  }

  /**
   * 恢复语音播放
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume()
    }
  }

  /**
   * 检查是否支持语音合成
   */
  isSpeechSupported(): boolean {
    return this.isSupported
  }

  /**
   * 获取可用语音列表
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  /**
   * 朗读单词（专门为词汇学习优化）
   * @param word - 单词
   * @param phonetic - 音标（可选）
   */
  async speakWord(word: string, phonetic?: string): Promise<void> {
    try {
      // 先朗读单词
      await this.speak(word, { rate: 0.7, pitch: 1.1 })
      
      // 短暂停顿
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 再次朗读单词（稍快一点）
      await this.speak(word, { rate: 0.9, pitch: 1 })
    } catch (error) {
      console.error('单词朗读失败:', error)
      throw error
    }
  }

  /**
   * 朗读例句
   * @param sentence - 例句
   */
  async speakSentence(sentence: string): Promise<void> {
    try {
      await this.speak(sentence, { rate: 0.8, pitch: 1 })
    } catch (error) {
      console.error('例句朗读失败:', error)
      throw error
    }
  }
}

// 创建全局语音服务实例
export const speechService = new SpeechService()

// 语音播放状态管理
export class SpeechPlayer {
  private isPlaying: boolean = false
  private currentWord: string = ''
  private autoPlay: boolean = false
  private onPlayStateChange?: (isPlaying: boolean) => void

  constructor(onPlayStateChange?: (isPlaying: boolean) => void) {
    this.onPlayStateChange = onPlayStateChange
  }

  /**
   * 播放单词语音
   */
  async playWord(word: string, phonetic?: string): Promise<void> {
    if (this.isPlaying) {
      speechService.stop()
    }

    this.isPlaying = true
    this.currentWord = word
    this.onPlayStateChange?.(true)

    try {
      await speechService.speakWord(word, phonetic)
    } catch (error) {
      console.error('播放失败:', error)
    } finally {
      this.isPlaying = false
      this.onPlayStateChange?.(false)
    }
  }

  /**
   * 播放例句
   */
  async playSentence(sentence: string): Promise<void> {
    if (this.isPlaying) {
      speechService.stop()
    }

    this.isPlaying = true
    this.onPlayStateChange?.(true)

    try {
      await speechService.speakSentence(sentence)
    } catch (error) {
      console.error('播放失败:', error)
    } finally {
      this.isPlaying = false
      this.onPlayStateChange?.(false)
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    speechService.stop()
    this.isPlaying = false
    this.onPlayStateChange?.(false)
  }

  /**
   * 设置自动播放
   */
  setAutoPlay(enabled: boolean): void {
    this.autoPlay = enabled
  }

  /**
   * 获取自动播放状态
   */
  getAutoPlay(): boolean {
    return this.autoPlay
  }

  /**
   * 获取播放状态
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * 获取当前播放的单词
   */
  getCurrentWord(): string {
    return this.currentWord
  }
}