import axios from 'axios'; 
import { logger } from '../utils/logger';

const BASE_URL = 'http://localhost:3000';

async function testDay7Features() {
  logger.info('Starting Day 7 feature tests...', null, 'TEST');

  try {
    // Test 1: Health check
    logger.info('Testing health endpoint...', null, 'TEST');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    logger.info('Health check result:', healthResponse.data, 'TEST');

    // Test 2: List articles (should be empty initially)
    logger.info('Testing article listing...', null, 'TEST');
    const articlesResponse = await axios.get(`${BASE_URL}/api/v1/articles`);
    logger.info(`Found ${articlesResponse.data.articles.length} articles`, articlesResponse.data.pagination, 'TEST');

    // Test 3: Scrape articles
    logger.info('Testing article scraping...', null, 'TEST');
    const scrapeResponse = await axios.post(`${BASE_URL}/api/v1/articles/admin/scrape`, {
      site: "psychologyToday"
    });
    logger.info('Scraping result:', {
      jobId: scrapeResponse.data.jobId,
      articlesScraped: scrapeResponse.data.articlesScraped
    }, 'TEST');

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Check articles after scraping
    logger.info('Testing updated article listing...', null, 'TEST');
    const updatedArticlesResponse = await axios.get(`${BASE_URL}/api/v1/articles`);
    logger.info(`Found ${updatedArticlesResponse.data.articles.length} articles after scraping`, 
      updatedArticlesResponse.data.pagination, 'TEST');

    // Test 5: Check scrape jobs
    logger.info('Testing scrape jobs listing...', null, 'TEST');
    const jobsResponse = await axios.get(`${BASE_URL}/api/v1/articles/admin/jobs`);
    logger.info(`Found ${jobsResponse.data.jobs.length} scrape jobs`, jobsResponse.data.pagination, 'TEST');

    // Test 6: Enhanced chatbot - greeting
    logger.info('Testing chatbot greeting...', null, 'TEST');
    const chatGreetingResponse = await axios.post(`${BASE_URL}/api/v1/chat/send`, {
      userId: 'test-user-1',
      message: 'Hello'
    });
    logger.info('Chatbot greeting response:', chatGreetingResponse.data, 'TEST');

    // Test 7: Enhanced chatbot - topic search
    logger.info('Testing chatbot anxiety search...', null, 'TEST');
    const chatAnxietyResponse = await axios.post(`${BASE_URL}/api/v1/chat/send`, {
      userId: 'test-user-1',
      message: 'I want to learn about anxiety'
    });
    logger.info('Chatbot anxiety response:', chatAnxietyResponse.data, 'TEST');

    // Test 8: Enhanced chatbot - help
    logger.info('Testing chatbot help...', null, 'TEST');
    const chatHelpResponse = await axios.post(`${BASE_URL}/api/v1/chat/send`, {
      userId: 'test-user-1',
      message: 'What can you help me with?'
    });
    logger.info('Chatbot help response:', chatHelpResponse.data, 'TEST');

    // Test 9: Search functionality
    logger.info('Testing article search...', null, 'TEST');
    const searchResponse = await axios.get(`${BASE_URL}/api/v1/articles?search=anxiety`);
    logger.info(`Found ${searchResponse.data.articles.length} articles matching 'anxiety'`, 
      searchResponse.data.pagination, 'TEST');

    logger.info('All Day 7 feature tests completed successfully!', null, 'TEST');

  } catch (error: any) {
    logger.error('Test failed:', {
      error: error.message,
      stack: error.stack,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    }, 'TEST');
  }
}

// Run tests with user confirmation
if (require.main === module) {
  testDay7Features().catch(console.error);
}

export { testDay7Features };
