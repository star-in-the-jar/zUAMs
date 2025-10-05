export { AIUtil, type ChatSessionConfig } from './ai';
export { calculateZusRetirementSimple, ZusCalculationInputSchema, type ZusCalculationInput, type ZusCalculationResult } from './zusCompute';

// For backwards compatibility - alias AIUtil as OpenAIChatSession
export { AIUtil as OpenAIChatSession } from './ai';