import { ChatOpenAI } from "@langchain/openai";
import z from "zod";
import { calculateZusRetirementSimple, ZusCalculationInputSchema } from "./zusCompute";
import { IncomeTaxUtil } from "@/sim/incomeTax";

export interface ChatSessionConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const AISchema = z.object({
    type: z.enum(["converse", "calculate"]).describe("Type of response - either conversation or calculation"),
    response: z.string().describe("The textual response to the user. When doing calculation using calculationSchema, it should be something like here is the result of the calculation; Here also add any warnings or notices if something seems to be wrong with the inputs."),
    thoughts: z.string().describe("Place to describe the rationale for why something happend the way it did. It's invisible to the user"),
    calculationSchema: ZusCalculationInputSchema.optional().describe("ZUS calculation parameters when type is 'calculate'")
})

export class AIUtil {
    private config: ChatSessionConfig;
    private chatModel: ChatOpenAI;
    private messages: ChatMessage[];
    private systemMessage: string;

    constructor(config: ChatSessionConfig = {}) {
        this.config = {
            apiKey: import.meta.env.VITE_OPENAI_API_KEY || config.apiKey,
            model: 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 1000,
            ...config
        };

        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required. Please set VITE_OPENAI_API_KEY environment variable or provide it in config.');
        }

        this.chatModel = new ChatOpenAI({
            apiKey: this.config.apiKey,
            model: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
        });

        this.messages = [];
        this.systemMessage = '';
    }

    setSystemMessage(message: string): void {
        this.systemMessage = message;
        // Reset messages when system message changes
        this.messages = [];
    }

    private buildFullPrompt(userMessage: string): string {
        let fullPrompt = this.systemMessage;
        
        // Add conversation history
        if (this.messages.length > 0) {
            fullPrompt += '\n\nPREVIOUS CONVERSATION:\n';
            for (const msg of this.messages) {
                if (msg.role === 'user') {
                    fullPrompt += `USER: ${msg.content}\n`;
                } else if (msg.role === 'assistant') {
                    fullPrompt += `ASSISTANT: ${msg.content}\n`;
                }
            }
        }
        
        fullPrompt += `\n\nCURRENT USER MESSAGE: ${userMessage}`;
        return fullPrompt;
    }

    async generateResponse(userMessage: string): Promise<string> {
        // Build the full prompt with system message and history
        const fullPrompt = this.buildFullPrompt(userMessage);

        try {
            // Try structured output first
            const structuredModel = this.chatModel.withStructuredOutput(AISchema, {
                method: "json_schema",
            })

            const res = await structuredModel.invoke(fullPrompt)
            
            let response: string;
            
            if(res.type === "calculate" && res.calculationSchema) {
                try {
                    const validatedInput = ZusCalculationInputSchema.parse(res.calculationSchema)
                    const calcResult = calculateZusRetirementSimple(validatedInput)
                    const netRetirement = IncomeTaxUtil.taxedZusRetirementMonthly(calcResult.baseMonthlyRetirement)
                    console.log("Calculating", res.calculationSchema, calcResult)
                    response = `${res.response}\n\nWynik obliczeń:\nPrognozowana miesięczna emerytura BRUTTO: ${calcResult.baseMonthlyRetirement.toFixed(2)} zł\nPrognozowana miesięczna emerytura NETTO: ${netRetirement.toFixed(2)} zł\n*wartość skorygowana o przewidywaną inflację i waloryzację świadczeń\n\nUWAGA: Urlopy macierzyńskie i zwolnienia chorobowe (L4) mogą wpłynąć na wysokość emerytury.`;
                } catch (validationError) {
                    console.error('Validation error for calculation schema:', validationError);
                    response = res.response + "\n\nNie mogłem przeprowadzić dokładnych obliczeń z podanymi parametrami. Proszę podać bardziej szczegółowe informacje.";
                }
            } else {
                response = res.response;
            }

            // Add messages to history
            this.messages.push({ role: 'user', content: userMessage });
            this.messages.push({ role: 'assistant', content: response });

            // Keep only last 10 messages (5 exchanges) to prevent token limit issues
            if (this.messages.length > 10) {
                this.messages = this.messages.slice(-10);
            }

            return response;
        } catch (error) {
            console.error('Structured output failed, falling back to regular chat:', error);
            
            // Fallback to regular chat without structured output
            const response = await this.chatModel.invoke(fullPrompt);
            const responseText = response.content as string;

            // Add messages to history
            this.messages.push({ role: 'user', content: userMessage });
            this.messages.push({ role: 'assistant', content: responseText });

            // Keep only last 10 messages (5 exchanges) to prevent token limit issues
            if (this.messages.length > 10) {
                this.messages = this.messages.slice(-10);
            }

            return responseText;
        }
    }

    // Method to add streaming capability for backwards compatibility
    async streamMessage(userMessage: string, onChunk: (chunk: string) => void): Promise<void> {
        // For now, we'll simulate streaming by sending the full response
        // In the future, this could be enhanced to use actual streaming
        const response = await this.generateResponse(userMessage);
        
        // Simulate streaming by sending chunks
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ' ' + words[i];
            onChunk(chunk);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}