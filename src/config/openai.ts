import Constants from 'expo-constants';

export default {
  apiKey: Constants.expoConfig?.extra?.openaiApiKey || process.env.OPENAI_API_KEY,
  defaultModel: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  baseUrl: 'https://api.openai.com/v1',
};
