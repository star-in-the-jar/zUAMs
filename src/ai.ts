import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { callAITool, getToolDescriptions } from "@/aiTools";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export interface ChatSessionConfig {
    apiKey?: string;
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

    constructor(config: ChatSessionConfig = {}) {
        this.config = {
            apiKey: import.meta.env.VITE_OPENAI_API_KEY || config.apiKey,
            model: 'gpt-4o-mini',
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

        // Process any tool calls in the response
        const processedContent = this.processToolCalls(response.content as string);

        // Add processed AI response to conversation history
        const processedResponse = new AIMessage(processedContent);
        this.messages.push(processedResponse);

        return processedContent;
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

        // Add tool descriptions to system message
        const systemMessageWithTools = systemMessage + '\n\n' + getToolDescriptions();

        // Add new system message at the beginning
        this.messages.unshift(new SystemMessage(systemMessageWithTools));
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

        // Use environment variable if apiKey is not provided
        if (!this.config.apiKey) {
            this.config.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        }

        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required. Please set VITE_OPENAI_API_KEY environment variable or provide it in config.');
        }

        // Recreate the chat model with new config
        this.chatModel = new ChatOpenAI({
            apiKey: this.config.apiKey,
            model: this.config.model,
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
     * Format tool call display
     */
    private formatToolCall(toolName: string, input: any): string {
        let formatted = `\n🔧 **WYKONUJĘ OBLICZENIA**\n`;
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        formatted += `🛠️ **Narzędzie**: ${toolName}\n`;
        
        if (toolName === 'calculateRetirement') {
            formatted += `📋 **Parametry kalkulacji**:\n`;
            formatted += `• **Płeć**: ${input.gender === 'male' ? 'Mężczyzna' : 'Kobieta'}\n`;
            formatted += `• **Wiek**: ${input.currentAge} lat\n`;
            formatted += `• **Wynagrodzenie**: ${input.currentMonthlySalary?.toLocaleString('pl-PL') || 'domyślne'} PLN\n`;
            formatted += `• **Urlop macierzyński**: ${input.monthsMaternityLeave || 0} miesięcy\n`;
        }
        
        formatted += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        return formatted;
    }

    /**
     * Process AI response and execute any tool calls found in it
     * @param response - The AI response text
     * @returns Processed response with tool results
     */
    private processToolCalls(response: string): string {
        const toolCallRegex = /TOOL:\s*(\w+)\s*INPUT:\s*({[^}]*})/g;
        let processedResponse = response;
        let match;

        while ((match = toolCallRegex.exec(response)) !== null) {
            const [fullMatch, toolName, inputJson] = match;
            
            try {
                const input = JSON.parse(inputJson);
                
                // Show tool call
                const toolCallDisplay = this.formatToolCall(toolName, input);
                
                // Execute tool
                const result = callAITool(toolName, input);
                
                // Format the tool result for display
                let toolResult = '';
                if (toolName === 'calculateRetirement') {
                    toolResult = this.formatRetirementResult(result);
                }
                
                // Replace the tool call with formatted call + result
                processedResponse = processedResponse.replace(fullMatch, toolCallDisplay + toolResult);
            } catch (error) {
                console.error('Tool execution error:', error);
                const errorMsg = `❌ **BŁĄD**: ${error instanceof Error ? error.message : 'Nieznany błąd'}`;
                processedResponse = processedResponse.replace(fullMatch, errorMsg);
            }
        }

        return processedResponse;
    }

    /**
     * Format retirement calculation result for display
     */
    private formatRetirementResult(result: any): string {
        const r = result;
        let formatted = `\n📊 **WYNIK KALKULACJI EMERYTURY**\n\n`;
        formatted += `💰 **Miesięczna emerytura BRUTTO**: ${Math.round(r.monthlyRetirementAmountGross).toLocaleString('pl-PL')} PLN\n`;
        formatted += `� **Miesięczna emerytura NETTO**: ${Math.round(r.monthlyRetirementAmountNet).toLocaleString('pl-PL')} PLN\n`;
        formatted += `📈 **Roczna emerytura BRUTTO**: ${Math.round(r.annualRetirementAmountGross).toLocaleString('pl-PL')} PLN\n`;
        formatted += `📉 **Roczna emerytura NETTO**: ${Math.round(r.annualRetirementAmountNet).toLocaleString('pl-PL')} PLN\n`;
        formatted += `�📅 **Rok przejścia na emeryturę**: ${r.retirementYear}\n`;
        formatted += `⏱️ **Łączne miesiące składkowe**: ${r.totalMonthsContributed} (${Math.round(r.totalMonthsContributed/12)} lat)\n`;
        
        if (r.monthsMaternityLeave > 0) {
            formatted += `👶 **Urlop macierzyński**: ${r.monthsMaternityLeave} miesięcy (${Math.round(r.monthsMaternityLeave/12*10)/10} lat)\n`;
        }
        formatted += `🏦 **Kapitał na koncie ZUS**: ${Math.round(r.totalAccountBalance).toLocaleString('pl-PL')} PLN\n`;
        formatted += `✅ **Uprawnienie do emerytury**: ${r.isEligible ? 'TAK' : 'NIE'}\n`;
        
        if (r.warnings && r.warnings.length > 0) {
            formatted += `\n⚠️ **Uwagi**:\n`;
            r.warnings.forEach((warning: string) => {
                formatted += `• ${warning}\n`;
            });
        }
        
        formatted += `\n💡 **Ważne informacje metodologiczne**:\n`;
        formatted += `• **Wartości realne**: Wszystkie kwoty przedstawione są w sile nabywczej dzisiejszych złotych\n`;
        formatted += `• **Korekta inflacyjna**: Prognoza uwzględnia przewidywany wzrost cen (inflację) w czasie\n`;
        formatted += `• **Rzeczywista wartość**: Pokazane kwoty odzwierciedlają faktyczną siłę nabywczą w momencie przejścia na emeryturę\n`;
        formatted += `• **Urlop macierzyński**: Okresy urlopu macierzyńskiego liczą się do stażu emerytalnego, ale bez wpłat na konto ZUS\n`;
        formatted += `\n💰 **Szczegóły podatkowe**:\n`;
        formatted += `• Kwota NETTO uwzględnia 9% składkę zdrowotną i 12% podatek dochodowy\n`;
        formatted += `• Zastosowano kwotę wolną od podatku: ${(20000).toLocaleString('pl-PL')} PLN rocznie\n`;
        formatted += `• Podatek naliczany od kwoty przekraczającej kwotę wolną\n`;
        
        return formatted;
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

        // Process any tool calls in the complete response
        const processedResponse = this.processToolCalls(fullResponse);
        
        // If tools were executed, send the processed result to the callback
        if (processedResponse !== fullResponse) {
            // Send the tool results
            const toolResults = processedResponse.slice(fullResponse.length);
            onChunk(toolResults);
        }

        // Add complete AI response to conversation history (processed version)
        const aiMessage = new AIMessage(processedResponse);
        this.messages.push(aiMessage);

        return processedResponse;
    }
}

// Example usage:
/*
// Using environment variable (recommended)
const chatSession = new OpenAIChatSession({
  model: 'gpt-4',
  temperature: 0.8
});

// Or providing API key directly
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

// Note: Make sure to set VITE_OPENAI_API_KEY in your .env file:
// VITE_OPENAI_API_KEY=your-actual-api-key-here
*/
