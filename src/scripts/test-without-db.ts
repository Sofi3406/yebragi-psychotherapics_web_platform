import { scraperService } from '../services/scraper.service';
import { chatbotService } from '../services/chatbot.service';
import { logger } from '../utils/logger';

async function testWithoutDatabase() {
  logger.info('Starting tests without database...', null, 'TEST');

  try {
    // Test 1: Scraper service
    logger.info('Testing scraper service...', null, 'TEST');
    const scrapedArticles = await scraperService.runSite('psychologyToday');
    logger.info(`Scraper service works! Retrieved ${scrapedArticles.length} articles`, 
      scrapedArticles.slice(0, 2), 'TEST');

    // Test 2: Chatbot service
    logger.info('Testing chatbot service...', null, 'TEST');
    
    const greetingResponse = await chatbotService.processMessage('Hello');
    logger.info('Chatbot greeting response:', greetingResponse, 'TEST');

    const anxietyResponse = await chatbotService.processMessage('I need help with anxiety');
    logger.info('Chatbot anxiety response:', anxietyResponse, 'TEST');

    const helpResponse = await chatbotService.processMessage('What can you help me with?');
    logger.info('Chatbot help response:', helpResponse, 'TEST');

    logger.info('All tests completed successfully!', null, 'TEST');

  } catch (error: any) {
    logger.error('Test failed:', { error: error.message, stack: error.stack }, 'TEST');
  }
}

// Run if this file is executed directly
testWithoutDatabase().catch(console.error);

export { testWithoutDatabase };
