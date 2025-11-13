
"use client";

import { useState } from 'react';
import { useToast } from './use-toast';

async function streamGoogleAiEnhancement(prompt: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error:", errorBody);
        throw new Error(errorBody.message || "Failed to fetch AI content.");
    }


    if (!response.body) {
        throw new Error("Response body is null");
    }
    return response.body;
}


export const useGeminiAiContentEnhancer = () => {
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');

    const generate = async () => {
        if (!prompt) {
            toast({
                title: 'Prompt is empty',
                description: 'Please enter a prompt to generate content.',
                variant: 'destructive',
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedContent('');

        const styledPrompt = `
You are a wiki editor. Generate a comprehensive, encyclopedia-style entry based on the user's topic.
The tone should be informative, slightly formal, but engaging.

**IMPORTANT FORMATTING RULES:**
1.  **Structure:** The output MUST be formatted with HTML. Start with an introductory paragraph. Then, use subheadings for different sections to organize the content logically.
2.  **Paragraphs:** Enclose every paragraph in <p>...</p> tags. Ensure there is a newline character between each closing </p> and the next opening <p> or <h3> tag for readability.
3.  **Subheadings:** Use <h3>...</h3> for all section titles. For example: <h3>Key Features</h3>.
4.  **Bolding:** Use <b>...</b> for emphasis on key terms within paragraphs, not for headings.
5.  **NO OTHER HTML:** Do not use any other HTML tags like <ul>, <li>, <h1>, <h2>, or markdown like #, *, -.

**EXAMPLE OUTPUT:**
<p>The Vortex Coaster is a marvel of modern engineering, pushing the boundaries of what's possible in a thrill ride. It was designed to simulate a journey through a wormhole.</p>

<h3>Design Philosophy</h3>
<p>Designed by the legendary engineer Dr. Aris Thorne, the Vortex was conceived with a focus on delivering a disorienting yet thrilling experience. The track features a record-breaking 7 inversions, including a zero-g stall and a double-helix corkscrew finale.</p>

<h3>Key Features</h3>
<p>The ride boasts a top speed of <b>85 mph</b> and a maximum height of <b>210 feet</b>. Its most unique element is the 'Chrono-Inversion,' a slow-motion heartline roll that provides a profound feeling of weightlessness.</p>

**GENERATE ENTRY FOR TOPIC:** "${prompt}"
        `;

        try {
            const stream = await streamGoogleAiEnhancement(styledPrompt);
            const reader = stream.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                setGeneratedContent((prev) => prev + chunk);
            }

        } catch (error: any) {
            console.error('Error generating content:', error);
            toast({
                title: 'Error Generating Content',
                description: error.message || 'There was a problem generating content. Please check your API key and try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        prompt,
        setPrompt,
        isGenerating,
        generatedContent,
        setGeneratedContent,
        generate,
    };
};
