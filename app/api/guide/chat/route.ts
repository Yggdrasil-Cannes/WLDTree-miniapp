import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Check for required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are WorldTree AI, a specialized genealogy research assistant designed to help users discover their family history and build their family tree.

Your role is to:
1. Guide users through genealogy research process
2. Help them understand DNA results and matches
3. Suggest historical records to search
4. Provide research strategies and tips
5. Offer encouragement and support in their family history journey

Key guidelines:
- Focus on genealogy research, family history, and DNA analysis
- Provide practical, actionable advice
- Be encouraging and supportive
- Suggest specific record types and research strategies
- Help users understand genealogy terminology
- Recommend reputable genealogy resources and databases

Format your responses to include:
🌳 Research Suggestions: [Specific actions to take]
📚 Resources: [Databases, websites, archives to check]
🔍 Next Steps: [What to do after current research]

Always be helpful, knowledgeable, and focused on genealogy research.`;

export async function POST(req: Request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'Chat service not configured',
          details: 'OpenAI API key is missing',
          code: 'CONFIG_ERROR'
        },
        { status: 503 }
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { 
          error: 'Message is required',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I'm here to help with your genealogy research. What would you like to know about tracing your family history?";

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error in genealogy guide chat:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack
    });
    
    // Handle specific OpenAI errors
    if (error?.message?.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'Chat service configuration error',
          details: 'Invalid API configuration',
          code: 'CONFIG_ERROR'
        },
        { status: 503 }
      );
    }
    
    if (error?.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Chat service temporarily unavailable',
          details: 'Rate limit exceeded',
          code: 'RATE_LIMIT'
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to process your genealogy question',
        details: error?.message || 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
} 