// 语音服务 - 文本转语音功能

export interface SpeechOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onEnergy?: (energy: number, frequencyData?: Uint8Array) => void
}

export class SpeechService {
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isSupported: boolean = false
  private stopEnergyMonitor: (() => void) | null = null

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

  private cleanupEnergyMonitor() {
    if (this.stopEnergyMonitor) {
      this.stopEnergyMonitor()
      this.stopEnergyMonitor = null
    }
  }

  private startSyntheticEnergyMonitor(
    text: string,
    rate: number,
    onEnergy: (energy: number, frequencyData?: Uint8Array) => void
  ) {
    let frameId = 0
    let stopped = false
    let lastPulseAt = performance.now()
    let pulseStrength = 0.42
    const startedAt = performance.now()
    const estimatedDuration = Math.max(1400, (text.length * 58) / Math.max(rate, 0.4))

    const tick = () => {
      if (stopped) return

      const now = performance.now()
      const elapsed = now - startedAt
      const pulseAge = now - lastPulseAt
      const wordPulse = Math.max(0, 1 - pulseAge / 420) * pulseStrength
      const cadence = (Math.sin(elapsed / 118) + 1) / 2
      const breath = (Math.sin(elapsed / 740) + 1) / 2
      const tail = Math.max(0, 1 - elapsed / (estimatedDuration + 900))
      const energy = Math.min(1, (0.12 + cadence * 0.2 + breath * 0.1 + wordPulse) * (0.56 + tail * 0.44))

      onEnergy(energy)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return {
      pulse(charIndex = 0) {
        lastPulseAt = performance.now()
        pulseStrength = 0.36 + (charIndex % 7) * 0.045
      },
      stop() {
        stopped = true
        if (frameId) {
          window.cancelAnimationFrame(frameId)
        }
        onEnergy(0)
      },
    }
  }

  /**
   * 使用 Web Audio API 监听真实音频元素的频率能量。
   * 后续接入 SiliconFlow TTS 的音频流时，可以复用这个入口驱动 NovaSprout。
   */
  async monitorAudioElement(
    audioElement: HTMLAudioElement,
    onEnergy: (energy: number, frequencyData?: Uint8Array) => void
  ): Promise<() => void> {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) {
      return () => onEnergy(0)
    }

    const audioContext = new AudioContextClass()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82

    const source = audioContext.createMediaElementSource(audioElement)
    source.connect(analyser)
    analyser.connect(audioContext.destination)

    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    let frameId = 0
    let stopped = false

    const tick = () => {
      if (stopped) return

      analyser.getByteFrequencyData(frequencyData)
      const average = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length
      onEnergy(Math.min(1, average / 148), frequencyData)
      frameId = window.requestAnimationFrame(tick)
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    tick()

    return () => {
      stopped = true
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
      source.disconnect()
      analyser.disconnect()
      void audioContext.close()
      onEnergy(0)
    }
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
      this.cleanupEnergyMonitor()

      const utterance = new SpeechSynthesisUtterance(text)
      const energyMonitor = options.onEnergy
        ? this.startSyntheticEnergyMonitor(text, options.rate || 0.8, options.onEnergy)
        : null
      this.stopEnergyMonitor = energyMonitor ? energyMonitor.stop : null
      
      // 设置语音参数
      const voice = this.getBestEnglishVoice()
      if (voice) {
        utterance.voice = voice
      }

      utterance.lang = options.lang || 'en-US'
      utterance.rate = options.rate || 0.8 // 稍慢一点，便于学习
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      utterance.onboundary = (event) => {
        energyMonitor?.pulse(event.charIndex)
      }

      // 事件处理
      utterance.onend = () => {
        this.cleanupEnergyMonitor()
        resolve()
      }
      utterance.onerror = (event) => {
        this.cleanupEnergyMonitor()
        reject(new Error(`语音播放失败: ${event.error}`))
      }

      this.synthesis.speak(utterance)
    })
  }

  /**
   * 停止语音播放
   */
  stop(): void {
    this.cleanupEnergyMonitor()
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
