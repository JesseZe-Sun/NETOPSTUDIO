# NetOpStudio AI 接口文档

本文档详细说明了 NetOpStudio 平台中所有 AI 接口的功能、参数和实现位置,方便后期更换或升级 AI 服务提供商。

---

## 目录

1. [核心配置](#核心配置)
2. [聊天对话接口](#聊天对话接口)
3. [图像生成接口](#图像生成接口)
4. [视频生成接口](#视频生成接口)
5. [视频分析接口](#视频分析接口)
6. [音频生成接口](#音频生成接口)
7. [音频转录接口](#音频转录接口)
8. [实时语音对话接口](#实时语音对话接口)
9. [辅助工具接口](#辅助工具接口)
10. [更换AI接口指南](#更换ai接口指南)

---

## 核心配置

### 配置位置
**文件**: `services/geminiService.ts`

### 当前配置
```typescript
const API_KEY = 'sk-61cPRlkHDLt1OtHQzOaKwiC4DAiBHLImjuL6dR9iRHIE13u7';
const BASE_URL = 'https://gaccodeapi.com/v1';
const DEFAULT_MODEL = 'gemini-3-pro-preview';
```

### 建议改进
- 将 API_KEY 移至环境变量 `.env` 文件
- 支持多个 API 提供商配置切换
- 添加 API 请求重试和超时配置

---

## 聊天对话接口

### 函数名称
`sendChatMessage()`

### 功能描述
实现多轮对话功能,支持深度思考模式、分镜脚本生成和提示词优化。

### 接口定义
```typescript
async function sendChatMessage(
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    newMessage: string,
    options?: {
        isThinkingMode?: boolean,      // 深度思考模式
        isStoryboard?: boolean,         // 分镜脚本模式
        isHelpMeWrite?: boolean         // 提示词优化模式
    }
): Promise<string>
```

### 使用场景
- **组件**: `AssistantPanel.tsx` (主创意助手)
- **组件**: `ChatWindow.tsx` (通用聊天窗口)

### 当前AI模型
- 默认: `gemini-3-pro-preview`

### System Prompts
- **通用助手**: 创意助手,提供多媒体创作支持
- **分镜模式**: 专业导演,将用户想法拆分为详细镜头描述,输出 JSON 数组
- **提示词优化**: 多模态 AI 提示词工程师,生成三种风格的提示词

### 更换建议
替换为其他大语言模型 (如 OpenAI GPT-4, Claude, 文心一言等):
- 修改 `getClient()` 函数的初始化逻辑
- 调整 `chat.sendMessage()` 的调用方式
- 适配不同 API 的响应格式

---

## 图像生成接口

### 函数名称
`generateImageFromText()`

### 功能描述
根据文本提示词生成图像,支持图生图 (Image-to-Image) 模式。

### 接口定义
```typescript
async function generateImageFromText(
    prompt: string,                    // 生成提示词
    model: string,                     // 模型名称
    inputImages?: string[],            // 输入图像 (Base64 格式)
    options?: {
        aspectRatio?: string,          // 宽高比 (如 '16:9', '1:1')
        resolution?: string,           // 分辨率
        count?: number                 // 生成数量
    }
): Promise<string[]>                   // 返回生成的图像数组 (Base64)
```

### 使用场景
- **组件**: `CanvasBoard.tsx` (画布节点图像生成)
- **服务**: `videoStrategies.ts` (视频前处理:图像修复和高清化)

### 当前AI模型
- 默认: `imagen-3.0-generate-002`

### 重要特性
- 支持多张输入图像 (用于图生图或风格迁移)
- 自动处理图像格式转换 (PNG/JPEG)
- 支持批量生成

### 更换建议
替换为其他图像生成模型 (如 DALL-E 3, Stable Diffusion, Midjourney API):
- 修改 `ai.models.generateContent()` 调用
- 适配不同模型的参数格式
- 处理响应中的图像数据提取逻辑

---

## 视频生成接口

### 函数名称
`generateVideo()`

### 功能描述
根据提示词和输入素材生成视频,支持多种生成模式。

### 接口定义
```typescript
async function generateVideo(
    prompt: string,                      // 视频生成提示词
    model: string,                       // 模型名称 (如 'veo-3.5', 'wan-2.1')
    options?: {
        aspectRatio?: string,            // 宽高比
        count?: number,                  // 生成数量
        generationMode?: VideoGenerationMode, // 生成模式
        resolution?: string              // 分辨率 ('720p', '1080p')
    },
    inputImageBase64?: string | null,    // 输入图像 (Image-to-Video)
    videoInput?: any,                    // 输入视频 (用于编辑模式)
    referenceImages?: string[],          // 参考图像 (用于角色迁移等)
    lastImageBase64?: string | null      // 结束帧 (用于首尾插帧)
): Promise<{
    uri: string,                         // 视频 URI
    isFallbackImage?: boolean,           // 是否为降级图像
    videoMetadata?: any,                 // 视频元数据
    uris?: string[]                      // 多个视频 URI
}>
```

### 视频生成模式
| 模式 | 说明 | 实现位置 |
|------|------|----------|
| `DEFAULT` | 基础文生视频/图生视频 | `videoStrategies.ts::processDefaultVideoGen` |
| `CONTINUE` | 剧情延展 (基于上游视频的最后一帧) | `videoStrategies.ts::processStoryContinuator` |
| `FIRST_LAST_FRAME` | 首尾插帧 (提供起始和结束帧) | `videoStrategies.ts::processFrameWeaver` |
| `CUT` | 局部分镜 (对视频片段重新生成) | `videoStrategies.ts::processSceneDirector` |
| `CHARACTER_REF` | 角色迁移 (将参考角色应用到新动作) | `videoStrategies.ts::processCharacterRef` |

### 使用场景
- **组件**: `CanvasBoard.tsx` (节点视频生成)
- **组件**: `SmartSequenceDock.tsx` (多帧序列生成)

### 当前AI模型
- 主力: `veo-3.5` (Google Veo 视频生成)
- 备选: `veo-3.1-generate-preview`
- Pollo 支持: `wan-2.1` (需要单独配置)

### 质量优化
自动在提示词后添加:
```
cinematic lighting, highly detailed, photorealistic, 4k,
smooth motion, professional color grading
```

### 降级策略
- 如果视频生成失败,自动降级为生成静态图像
- 前端需处理 `isFallbackImage` 标志

### 更换建议
替换为其他视频生成模型 (如 Runway Gen-3, Pika, Luma AI):
- 修改 `ai.models.generateVideos()` 调用
- 适配不同模型的输入格式 (图像、视频、参考图)
- 处理长时间生成的轮询逻辑
- 调整分辨率和时长参数

---

## 视频分析接口

### 函数名称
`analyzeVideo()`

### 功能描述
分析视频内容,提取视觉风格、动作、镜头语言等信息。

### 接口定义
```typescript
async function analyzeVideo(
    videoBase64OrUrl: string,           // 视频 Base64 或 URL
    prompt: string,                     // 分析指令
    model: string                       // 模型名称
): Promise<string>                      // 返回分析结果文本
```

### 使用场景
- **策略**: `videoStrategies.ts::processSceneDirector` (提取视频风格)
- **策略**: `videoStrategies.ts::processCharacterRef` (提取动作描述)

### 典型分析任务
1. **风格分析**: "分析视觉风格、光照、构图和调色"
2. **动作提取**: "描述人物的物理动作和相机运动,忽略人物身份"

### 当前AI模型
- `gemini-2.5-flash` (视觉理解模型)

### 更换建议
替换为其他多模态模型 (如 GPT-4V, Claude 3 Vision):
- 修改 `ai.models.generateContent()` 调用
- 适配视频输入格式 (某些模型可能不支持直接视频输入,需要先提取关键帧)

---

## 音频生成接口

### 函数名称
`generateAudio()`

### 功能描述
文本转语音 (TTS),支持声音克隆和情感控制。

### 接口定义
```typescript
async function generateAudio(
    prompt: string,                      // 要朗读的文本
    referenceAudio?: string,             // 参考音频 (用于声音克隆)
    options?: {
        persona?: any,                   // 声音画像 (预设角色)
        emotion?: any                    // 情感基调
    }
): Promise<string>                       // 返回音频 Base64 (WAV 格式)
```

### 预设声音画像
| 画像 | 描述 |
|------|------|
| 深沉叙述 | 男性,低沉,缓慢叙事风格 |
| 活力解说 | 高能量,快节奏,YouTuber 风格 |
| 知性新闻 | 专业女性,中性语调,广播标准 |
| 动漫少女 | 高音,可爱,表现力丰富 |
| 电影旁白 | 沙哑,戏剧性,电影预告风格 |
| 慈祥长者 | 温暖,颤抖,智慧的祖父母声音 |

### 情感选项
- 默认 (Neutral)
- 开心 (Happy)
- 悲伤 (Sad)
- 愤怒 (Angry)
- 耳语 (Whisper)
- 恐惧 (Scared)

### 使用场景
- **组件**: `SonicStudio.tsx` (声音工厂)

### 当前AI模型
- `gemini-2.5-flash-preview-tts`

### 音频格式处理
- 原始输出: PCM (16-bit, 24kHz)
- 自动转换为: WAV 格式 (包含完整 WAV 头)

### 更换建议
替换为其他 TTS 模型 (如 ElevenLabs, Azure Speech, 微软 TTS):
- 修改 `ai.models.generateContent()` 调用
- 适配不同的声音选择和情感参数
- 处理音频格式转换 (如果输出格式不是 PCM/WAV)

---

## 音频转录接口

### 函数名称
`transcribeAudio()`

### 功能描述
语音转文字 (STT),支持多种音频格式。

### 接口定义
```typescript
async function transcribeAudio(
    audioBase64: string                  // 音频 Base64 (支持 WAV, MP3, M4A, AAC)
): Promise<string>                       // 返回转录文本
```

### 使用场景
- **组件**: `SonicStudio.tsx` (语音转文字功能)

### 当前AI模型
- `gemini-3-pro-preview` (默认模型,具备音频理解能力)

### 转录指令
```
Transcribe this audio strictly verbatim.
(严格逐字转录音频内容)
```

### 更换建议
替换为其他 STT 模型 (如 Whisper, Google Speech-to-Text, Azure STT):
- 修改 `ai.models.generateContent()` 调用
- 适配音频格式要求
- 处理长音频的分段转录

---

## 实时语音对话接口

### 函数名称
`connectLiveSession()`

### 功能描述
建立双向实时语音对话连接,支持语音输入和语音输出。

### 接口定义
```typescript
async function connectLiveSession(
    onAudioData: (base64: string) => void, // 接收 AI 回复音频的回调
    onClose: () => void                    // 连接关闭回调
): Promise<LiveSession>                    // 返回会话对象
```

### 会话对象方法
- `sendRealtimeInput()`: 发送实时音频输入
- 自动管理 WebSocket 连接

### 使用场景
- **组件**: `SonicStudio.tsx` (实时语音对话功能)

### 当前AI模型
- `gemini-2.5-flash-native-audio-preview-09-2025`

### 技术细节
- **输入**: 16kHz PCM,单声道
- **输出**: 24kHz PCM,单声道
- **传输**: WebSocket (通过 Google GenAI SDK)

### 音频处理流程
1. 麦克风捕获 → `ScriptProcessorNode`
2. Float32Array → Int16 PCM
3. Base64 编码 → 通过 WebSocket 发送
4. 接收 Base64 PCM → 解码为 AudioBuffer
5. 调度播放 (避免断断续续)

### 更换建议
替换为其他实时对话 API (如 OpenAI Realtime API, Azure Speech):
- 实现新的 WebSocket 连接逻辑
- 适配音频编码格式要求
- 处理 VAD (语音活动检测) 和打断逻辑

---

## 辅助工具接口

### 1. 分镜规划 `planStoryboard()`

#### 功能
将用户的创意拆分为详细的分镜脚本。

#### 接口定义
```typescript
async function planStoryboard(
    prompt: string,                      // 用户创意
    context: string                      // 上下文信息
): Promise<string[]>                     // 返回分镜描述数组
```

#### 输出格式
JSON 数组,每个元素是一个详细的镜头描述。

#### 使用场景
- 分镜脚本生成 (未在当前 UI 中直接调用,但服务已实现)

---

### 2. 视频提示词编排 `orchestrateVideoPrompt()`

#### 功能
分析多张图像序列,生成无缝过渡的视频提示词。

#### 接口定义
```typescript
async function orchestrateVideoPrompt(
    images: string[],                    // 图像序列 (Base64)
    userPrompt: string                   // 用户意图
): Promise<string>                       // 返回优化后的视频提示词
```

#### 使用场景
- **策略**: `videoStrategies.ts::processFrameWeaver` (首尾插帧模式)

---

### 3. 图像编辑 `editImageWithText()`

#### 功能
基于文本指令编辑图像。

#### 接口定义
```typescript
async function editImageWithText(
    imageBase64: string,                 // 输入图像
    prompt: string,                      // 编辑指令
    model: string                        // 模型名称
): Promise<string>                       // 返回编辑后的图像
```

#### 实现方式
内部复用 `generateImageFromText()`,传入输入图像。

---

### 4. 图像格式转换 `convertImageToCompatibleFormat()`

#### 功能
将图像转换为 Veo 兼容的格式 (PNG/JPEG)。

#### 使用场景
视频生成前的图像预处理。

---

### 5. 视频帧提取 `extractLastFrame()`

#### 功能
从视频中提取最后一帧。

#### 使用场景
- **策略**: `videoStrategies.ts::processStoryContinuator` (剧情延展)
- **策略**: `videoStrategies.ts::processSceneDirector` (局部分镜)

---

### 6. URL 转 Base64 `urlToBase64()`

#### 功能
将网络 URL 的资源转换为 Base64 Data URI。

#### 使用场景
处理远程图像/视频素材。

---

## 更换AI接口指南

### 通用步骤

1. **确定替换范围**
   - 仅替换某个功能模块 (如只替换图像生成)
   - 全面替换为新的 AI 提供商

2. **修改核心配置**
   - 文件: `services/geminiService.ts`
   - 修改 `API_KEY`, `BASE_URL`, `DEFAULT_MODEL`
   - 建议迁移到环境变量

3. **适配 SDK 初始化**
   - 修改 `getClient()` 函数
   - 安装新的 SDK: `npm install <new-sdk>`

4. **调整接口调用**
   - 查找所有 `ai.models.generateContent()` 调用
   - 适配新 API 的请求格式
   - 处理响应数据结构差异

5. **处理特殊功能**
   - 如果新 API 不支持某些功能 (如实时语音),需要降级或移除
   - 对于视频生成,可能需要调整轮询和异步处理逻辑

6. **测试验证**
   - 测试每个功能模块
   - 验证错误处理和降级策略
   - 检查性能和响应时间

---

### 常见替换场景

#### 场景 1: 替换为 OpenAI API

**优点**:
- 强大的 GPT-4 模型
- 成熟的 DALL-E 3 图像生成
- 完善的文档和社区支持

**局限**:
- 视频生成需要第三方服务 (如 Runway)
- 实时语音对话使用 Realtime API (格式不同)

**修改清单**:
- 安装 `npm install openai`
- 修改 `getClient()` 返回 `OpenAI` 实例
- 替换聊天调用为 `client.chat.completions.create()`
- 替换图像生成为 `client.images.generate()`

---

#### 场景 2: 替换为国内大模型 (如文心一言、通义千问)

**优点**:
- 中文支持更好
- 国内访问速度快
- 合规性更好

**局限**:
- 多模态能力可能较弱
- 视频生成支持有限

**修改清单**:
- 参考对应 API 文档安装 SDK
- 适配中文 System Prompts
- 调整参数命名 (如 `max_tokens` → `max_output_tokens`)

---

#### 场景 3: 混合使用多个 AI 提供商

**策略**:
- 聊天使用 OpenAI GPT-4
- 图像使用 Midjourney API
- 视频使用 Runway Gen-3
- 音频使用 ElevenLabs

**实现方式**:
- 创建多个客户端实例
- 在各个函数中根据功能调用不同客户端
- 统一错误处理和降级逻辑

---

## 关键注意事项

### 1. API Key 安全
- 当前 API Key 硬编码在代码中 (**不推荐**)
- 建议迁移到 `.env` 文件:
  ```env
  VITE_GEMINI_API_KEY=your_key_here
  VITE_GEMINI_BASE_URL=https://gaccodeapi.com/v1
  ```

### 2. 错误处理
- 实现了重试机制 (`retryWithBackoff`)
- 503/429 错误自动重试 3 次,指数退避
- 视频生成失败自动降级为图像生成

### 3. 性能优化
- 并行生成多个视频 (`Promise.allSettled`)
- 音频流式播放 (避免等待完整下载)

### 4. 跨域问题
- 视频和图像操作使用 `crossOrigin = 'Anonymous'`
- 如遇 CORS 问题,需配置后端代理

---

## 技术栈

- **核心 SDK**: `@google/genai` (Google Generative AI SDK)
- **音频处理**: Web Audio API (`AudioContext`, `ScriptProcessorNode`)
- **视频处理**: Canvas API (帧提取)
- **数据格式**: Base64 Data URI

---

## 联系信息

如有更换 AI 接口的需求或问题,请联系开发团队。

**文档版本**: v1.0
**最后更新**: 2026-01-14
