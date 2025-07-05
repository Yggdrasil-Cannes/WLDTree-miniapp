import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const { message } = await req.json();

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
  } catch (error) {
    console.error('Error in genealogy guide chat:', error);
    return NextResponse.json(
      { error: 'Failed to process your genealogy question' },
      { status: 500 }
    );
  }
} 