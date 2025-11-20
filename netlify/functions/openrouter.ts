import type { Handler, HandlerEvent } from '@netlify/functions';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'https://360man.netlify.app';
const SITE_NAME = 'Respect Pill';
const AI_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free";

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check if API key is available
  if (!OPENROUTER_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenRouter API key not configured' }),
    };
  }

  try {
    const { systemPrompt, userPrompt } = JSON.parse(event.body || '{}');

    if (!systemPrompt || !userPrompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing systemPrompt or userPrompt' }),
      };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": AI_MODEL,
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": userPrompt }
        ],
        "temperature": 0.7,
        "max_tokens": 2000
      })
    });

    if (!response.ok) {
      console.error(`OpenRouter API Error: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `OpenRouter API error: ${response.statusText}` }),
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No content received from OpenRouter' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ content }),
    };

  } catch (error) {
    console.error('Error in OpenRouter function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};