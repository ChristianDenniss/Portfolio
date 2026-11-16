import { openai } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage
} from 'ai'

import { buildAuntieDotSystemPrompt } from '@/lib/auntieDotKnowledge'
import {
  AUNTIE_DOT_MAX_CHARS,
  AUNTIE_DOT_MAX_CONTEXT_MESSAGES,
  AUNTIE_DOT_MAX_OUTPUT_TOKENS,
  textFromUiParts
} from '@/lib/auntieDotLimits'
import {
  auntieDotRateLimit,
  clientKeyFromRequest,
  limitMessageForCode
} from '@/lib/auntieDotRateLimit'
import { auntieDotTools } from '@/lib/auntieDotTools'

export const maxDuration = 30

function isUIMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== 'object') return false
  const msg = value as { role?: unknown; parts?: unknown }
  return (
    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
    Array.isArray(msg.parts)
  )
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'Uplink denied // No auth token' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Malformed packet' }, { status: 400 })
  }

  const raw = body as { messages?: unknown; theater?: unknown }
  if (!Array.isArray(raw.messages) || raw.messages.length === 0) {
    return Response.json({ error: 'Empty uplink' }, { status: 400 })
  }

  const messages = raw.messages.filter(isUIMessage).slice(-AUNTIE_DOT_MAX_CONTEXT_MESSAGES)
  if (messages.length === 0) {
    return Response.json({ error: 'Empty uplink' }, { status: 400 })
  }

  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const lastUserText = lastUser ? textFromUiParts(lastUser.parts).trim() : ''
  if (!lastUserText) {
    return Response.json({ error: 'Empty uplink' }, { status: 400 })
  }
  if (lastUserText.length > AUNTIE_DOT_MAX_CHARS) {
    return Response.json(
      { error: `Packet too large // Max ${AUNTIE_DOT_MAX_CHARS} characters` },
      { status: 413 }
    )
  }

  // Rate / quota after payload checks so junk does not burn a slot incorrectly —
  // still counted only when we accept. Gap/dup/hourly/daily bind to IP, not UI session.
  const limited = auntieDotRateLimit(clientKeyFromRequest(req), {
    messageText: lastUserText
  })
  if (!limited.ok) {
    return Response.json(
      { error: limitMessageForCode(limited.code) },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec) }
      }
    )
  }

  const theater = typeof raw.theater === 'string' ? raw.theater.slice(0, 80) : undefined

  const result = streamText({
    model: openai('gpt-5-nano'),
    system: buildAuntieDotSystemPrompt(theater),
    messages: await convertToModelMessages(messages),
    tools: auntieDotTools,
    stopWhen: stepCountIs(3),
    maxOutputTokens: AUNTIE_DOT_MAX_OUTPUT_TOKENS,
    providerOptions: {
      openai: {
        reasoningEffort: 'minimal'
      }
    },
    onError({ error }) {
      console.error('[auntie-dot]', error)
    }
  })

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      const msg = error instanceof Error ? error.message : String(error ?? '')
      if (/no credits remaining|billing|insufficient.?quota/i.test(msg)) {
        return 'Uplink denied // OpenAI credits depleted'
      }
      if (/incorrect api key|invalid.?api.?key|401/i.test(msg)) {
        return 'Uplink denied // Bad auth token'
      }
      if (/rate.?limit|429/i.test(msg)) {
        return 'Channel congested // Retry shortly'
      }
      return 'Signal degraded // Provider error'
    }
  })
}
