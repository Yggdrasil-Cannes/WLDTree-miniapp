import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, hasCredits } = await req.json();

    if (!hasCredits) {
      return new Response(
        JSON.stringify({ error: "Payment required for genealogy consultation" }),
        { status: 402 }
      );
    }

    const result = streamText({
      model: openai('gpt-4-turbo-preview'),
      messages: [
        {
          role: "system",
          content: `You are WorldTree AI, a specialized genealogy research consultant with deep expertise in family history research.
          
          Your expertise includes:
          - Family tree construction and analysis
          - DNA analysis and match interpretation
          - Historical record research strategies
          - Immigration and migration patterns
          - Census and vital record analysis
          - Genealogy research methodology
          
          When providing genealogy consultation:
          - Ask clarifying questions about family history goals
          - Suggest specific record types and repositories
          - Provide research strategies tailored to time periods and locations
          - Explain DNA results and potential matches
          - Recommend next steps based on current research
          - Consider historical context and migration patterns
          - Suggest ways to verify and document findings
          
          Always maintain a helpful and encouraging tone while being thorough and accurate in your genealogy guidance.`
        },
        ...messages
      ]
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Genealogy consultation error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to process genealogy consultation" }),
      { status: 500 }
    );
  }
} 