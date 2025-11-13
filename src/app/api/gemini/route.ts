
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const runtime = 'edge';

// Function to convert the response stream to a browser-readable stream
function GoogleAIStream(stream: AsyncGenerator<any, any, unknown>) {
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream) {
        try {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
        } catch (e) {
            console.error("Error processing chunk:", e);
        }
      }
      controller.close();
    },
  });
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ message: 'The GEMINI_API_KEY environment variable is not set.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (!prompt) {
        return new Response(JSON.stringify({ message: 'A prompt is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
        },
    ];

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        safetySettings,
    });

    const result = await model.generateContentStream(prompt);
    
    const stream = GoogleAIStream(result.stream);

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        }
    });

  } catch (error: any) {
    console.error('Unhandled error in /api/gemini:', error);
    // Ensure a proper JSON response for errors
    return new Response(
      JSON.stringify({ message: error.message || 'An unexpected error occurred.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
