$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$audioDir = Join-Path $root "public\remotion-audio"
$videoDir = Join-Path $root "public\remotion-video"
$baseVideo = Join-Path $root "out\wenya-starmap-launch.mp4"
$publicVideo = Join-Path $videoDir "wenya-starmap-launch-base.mp4"

New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
New-Item -ItemType Directory -Force -Path $videoDir | Out-Null

if (-not (Test-Path -LiteralPath $baseVideo)) {
  throw "Base silent video not found: $baseVideo. Render the silent video first, or place it at this path."
}

Copy-Item -LiteralPath $baseVideo -Destination $publicVideo -Force

Add-Type -AssemblyName System.Speech

function Get-FemaleVoiceName {
  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
    $voices = @($synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name })
    $preferred = $voices | Where-Object { $_ -match "Huihui" } | Select-Object -First 1
    if (-not $preferred) { $preferred = $voices | Where-Object { $_ -match "Zira" } | Select-Object -First 1 }
    if (-not $preferred) { $preferred = $voices | Select-Object -First 1 }
    return $preferred
  } finally {
    $synth.Dispose()
  }
}

function Write-Narration {
  param(
    [Parameter(Mandatory = $true)][string]$FileName,
    [Parameter(Mandatory = $true)][string]$Text,
    [Parameter(Mandatory = $true)][string]$VoiceName,
    [int]$Rate = -1
  )

  $path = Join-Path $audioDir $FileName
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }

  $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
  try {
    $synth.SelectVoice($VoiceName)
    $synth.Rate = $Rate
    $synth.Volume = 100
    $synth.SetOutputToWaveFile($path)
    $synth.Speak($Text)
  } finally {
    $synth.Dispose()
  }
}

function Write-Ascii {
  param([System.IO.BinaryWriter]$Writer, [string]$Text)
  $Writer.Write([System.Text.Encoding]::ASCII.GetBytes($Text))
}

function Write-SynthWav {
  param(
    [Parameter(Mandatory = $true)][string]$FileName,
    [Parameter(Mandatory = $true)][double]$Duration,
    [Parameter(Mandatory = $true)][scriptblock]$Sample
  )

  $path = Join-Path $audioDir $FileName
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Force
  }

  $sampleRate = 44100
  $channels = 1
  $bitsPerSample = 16
  $bytesPerSample = 2
  $sampleCount = [int]($Duration * $sampleRate)
  $dataSize = $sampleCount * $channels * $bytesPerSample

  $stream = [System.IO.File]::Create($path)
  $writer = New-Object System.IO.BinaryWriter($stream)

  try {
    Write-Ascii $writer "RIFF"
    $writer.Write([int](36 + $dataSize))
    Write-Ascii $writer "WAVE"
    Write-Ascii $writer "fmt "
    $writer.Write([int]16)
    $writer.Write([int16]1)
    $writer.Write([int16]$channels)
    $writer.Write([int]$sampleRate)
    $writer.Write([int]($sampleRate * $channels * $bytesPerSample))
    $writer.Write([int16]($channels * $bytesPerSample))
    $writer.Write([int16]$bitsPerSample)
    Write-Ascii $writer "data"
    $writer.Write([int]$dataSize)

    for ($i = 0; $i -lt $sampleCount; $i++) {
      $t = $i / $sampleRate
      $raw = & $Sample $t $Duration
      $clamped = [Math]::Max(-1, [Math]::Min(1, $raw))
      $writer.Write([int16]($clamped * 32767))
    }
  } finally {
    $writer.Dispose()
    $stream.Dispose()
  }
}

$voiceName = Get-FemaleVoiceName
Write-Host "Using narration voice: $voiceName"

Write-Narration -FileName "narration-intro.wav" -Text "传统教辅，把语言学习拆成一格一格的题目。问芽星图想做的，是把好奇还给孩子，把成长交还给路径。Question by question, growth becomes a living map." -VoiceName $voiceName -Rate -1
Write-Narration -FileName "narration-starmap.wav" -Text "当你点亮第一颗星，词汇、语法、听力和口语不再是孤岛。它们会沿着一条可追踪，可复盘，可继续生长的星际路线，依次苏醒。" -VoiceName $voiceName -Rate -1
Write-Narration -FileName "narration-ai.wav" -Text "NovaSprout，像一位随时在线的外教与陪伴者。声音进入，节奏出现，语法纠错，表达重写和即时追问一起发生。孩子听见反馈，也看见自己正在发光。" -VoiceName $voiceName -Rate -1
Write-Narration -FileName "narration-stripe.wav" -Text "学习要长出来，也要跑得起来。星芽燃料，Stripe 扣费，会员与账单，让这张星图拥有真实可运营的商业骨架。" -VoiceName $voiceName -Rate -1
Write-Narration -FileName "narration-outro.wav" -Text "最后，所有提问都会回到同一个答案。绘制属于你的个性化语言星图，让每一次发问，都照亮下一段成长。" -VoiceName $voiceName -Rate -1

Write-SynthWav "ambient-space.wav" 30 {
  param($t, $duration)
  $fadeIn = [Math]::Min(1, $t / 4)
  $fadeOut = [Math]::Min(1, ($duration - $t) / 4)
  $env = [Math]::Max(0, [Math]::Min($fadeIn, $fadeOut))
  $pulse = 0.65 + 0.35 * [Math]::Sin(2 * [Math]::PI * 0.045 * $t)
  $tone =
    0.28 * [Math]::Sin(2 * [Math]::PI * 55 * $t) +
    0.18 * [Math]::Sin(2 * [Math]::PI * 82.5 * $t) +
    0.10 * [Math]::Sin(2 * [Math]::PI * 165 * $t)
  return $tone * $pulse * $env
}

Write-SynthWav "sfx-logo-bloom.wav" 2.2 {
  param($t, $duration)
  $env = [Math]::Pow([Math]::Max(0, 1 - $t / $duration), 1.8) * [Math]::Min(1, $t / 0.22)
  $freq = 180 + 760 * [Math]::Pow($t / $duration, 1.7)
  return (
    0.55 * [Math]::Sin(2 * [Math]::PI * $freq * $t) +
    0.22 * [Math]::Sin(2 * [Math]::PI * ($freq * 1.5) * $t)
  ) * $env
}

Write-SynthWav "sfx-star-hover.wav" 0.7 {
  param($t, $duration)
  $env = [Math]::Sin([Math]::PI * $t / $duration)
  $freq = 520 + 180 * [Math]::Sin(2 * [Math]::PI * 1.2 * $t)
  return 0.42 * [Math]::Sin(2 * [Math]::PI * $freq * $t) * $env
}

Write-SynthWav "sfx-star-click.wav" 1.1 {
  param($t, $duration)
  $pluck = [Math]::Exp(-5.2 * $t)
  $spark = [Math]::Exp(-2.4 * [Math]::Max(0, $t - 0.14))
  return (
    0.55 * [Math]::Sin(2 * [Math]::PI * 740 * $t) * $pluck +
    0.32 * [Math]::Sin(2 * [Math]::PI * 1180 * $t) * $spark
  )
}

Write-SynthWav "sfx-path-ignite.wav" 2.4 {
  param($t, $duration)
  $rise = [Math]::Min(1, $t / 0.8)
  $fall = [Math]::Max(0, 1 - $t / $duration)
  $freq = 260 + 620 * ($t / $duration)
  return (
    0.34 * [Math]::Sin(2 * [Math]::PI * $freq * $t) +
    0.20 * [Math]::Sin(2 * [Math]::PI * ($freq * 2.03) * $t)
  ) * $rise * $fall
}

Write-SynthWav "sfx-ai-pulse.wav" 1.6 {
  param($t, $duration)
  $env = [Math]::Sin([Math]::PI * $t / $duration)
  $wobble = 1 + 0.08 * [Math]::Sin(2 * [Math]::PI * 7 * $t)
  return (
    0.38 * [Math]::Sin(2 * [Math]::PI * 392 * $wobble * $t) +
    0.24 * [Math]::Sin(2 * [Math]::PI * 588 * $wobble * $t)
  ) * $env
}

Write-SynthWav "sfx-payment-open.wav" 1.2 {
  param($t, $duration)
  $env = [Math]::Sin([Math]::PI * $t / $duration)
  return (
    0.25 * [Math]::Sin(2 * [Math]::PI * 160 * $t) +
    0.36 * [Math]::Sin(2 * [Math]::PI * (620 + 280 * $t) * $t)
  ) * $env
}

Write-SynthWav "sfx-payment-confirm.wav" 1.3 {
  param($t, $duration)
  $env = [Math]::Exp(-2.8 * $t)
  return (
    0.38 * [Math]::Sin(2 * [Math]::PI * 880 * $t) +
    0.28 * [Math]::Sin(2 * [Math]::PI * 1320 * $t) +
    0.18 * [Math]::Sin(2 * [Math]::PI * 1760 * $t)
  ) * $env
}

Write-SynthWav "sfx-outro-expanse.wav" 5.0 {
  param($t, $duration)
  $fadeIn = [Math]::Min(1, $t / 1.1)
  $fadeOut = [Math]::Min(1, ($duration - $t) / 1.2)
  $env = [Math]::Max(0, [Math]::Min($fadeIn, $fadeOut))
  $sweep = 150 + 540 * [Math]::Pow($t / $duration, 1.2)
  return (
    0.30 * [Math]::Sin(2 * [Math]::PI * $sweep * $t) +
    0.18 * [Math]::Sin(2 * [Math]::PI * ($sweep * 1.75) * $t) +
    0.12 * [Math]::Sin(2 * [Math]::PI * 55 * $t)
  ) * $env
}

Write-Host "Audio assets written to $audioDir"
Write-Host "Base video copied to $publicVideo"
