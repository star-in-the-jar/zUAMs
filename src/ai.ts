import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export interface ChatSessionConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

/**
 * Simple OpenAI Chat Session Class
 * Manages a single chat conversation with OpenAI using LangChain
 */
export class OpenAIChatSession {
    private chatModel: ChatOpenAI;
    private messages: BaseMessage[] = [];
    private config: ChatSessionConfig;

    constructor(config: ChatSessionConfig) {
        this.config = {
            model: 'gpt-5-mini',
            temperature: 0.7,
            maxTokens: 1000,
            ...config
        };

        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.config.apiKey,
            modelName: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
        });
    }

    /**
     * Send a message to the AI and get a response
     * @param message - The user's message
     * @returns Promise with the AI's response
     */
    async sendMessage(message: string): Promise<string> {
        // Add user message to conversation history
        const userMessage = new HumanMessage(message);
        this.messages.push(userMessage);

        // Get AI response
        const response = await this.chatModel.invoke(this.messages);

        // Add AI response to conversation history
        this.messages.push(response);

        return response.content as string;
    }

    /**
     * Get the conversation history as an array of chat messages
     * @returns Array of chat messages
     */
    getConversationHistory(): ChatMessage[] {
        return this.messages.map(msg => ({
            role: msg instanceof HumanMessage ? 'user' : 'assistant',
            content: msg.content as string,
            timestamp: new Date()
        }));
    }

    /**
     * Clear the conversation history
     */
    clearHistory(): void {
        this.messages = [];
    }

    /**
     * Set a system message to define the AI's behavior
     * @param systemMessage - The system message
     */
    setSystemMessage(systemMessage: string): void {
        // Remove existing system message if any
        this.messages = this.messages.filter(msg => msg.constructor.name !== 'SystemMessage');

        // Add new system message at the beginning
        this.messages.unshift(new SystemMessage(systemMessage));
    }

    /**
     * Get the current model configuration
     */
    getConfig(): ChatSessionConfig {
        return { ...this.config };
    }

    /**
     * Update model configuration
     * @param newConfig - Partial configuration to update
     */
    updateConfig(newConfig: Partial<ChatSessionConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // Recreate the chat model with new config
        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.config.apiKey,
            modelName: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
        });
    }

    /**
     * Get the total number of messages in the conversation
     */
    getMessageCount(): number {
        return this.messages.length;
    }

    /**
     * Stream a response from the AI (for real-time responses)
     * @param message - The user's message
     * @param onChunk - Callback function called for each chunk of the response
     * @returns Promise that resolves when streaming is complete
     */
    async streamMessage(message: string, onChunk: (chunk: string) => void): Promise<string> {
        // Add user message to conversation history
        const userMessage = new HumanMessage(message);
        this.messages.push(userMessage);

        let fullResponse = '';

        // Stream the response
        const stream = await this.chatModel.stream(this.messages);

        for await (const chunk of stream) {
            const content = chunk.content as string;
            fullResponse += content;
            onChunk(content);
        }

        // Add complete AI response to conversation history
        const aiMessage = new AIMessage(fullResponse);
        this.messages.push(aiMessage);

        return fullResponse;
    }
}

// Example usage:
/*
const chatSession = new OpenAIChatSession({
  apiKey: 'your-openai-api-key',
  model: 'gpt-4',
  temperature: 0.8
});

// Send a message
const response = await chatSession.sendMessage('Hello, how are you?');
console.log('AI Response:', response);

// Set system message
chatSession.setSystemMessage('You are a helpful assistant that speaks like a pirate.');

// Stream a response
await chatSession.streamMessage('Tell me about the weather', (chunk) => {
  process.stdout.write(chunk);
});

// Get conversation history
const history = chatSession.getConversationHistory();
console.log('Conversation:', history);
*/
