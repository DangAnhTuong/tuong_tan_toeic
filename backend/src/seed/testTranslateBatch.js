const { translateText } = require('../utils/universalTranslator');

async function testBatch() {
  const samples = [
    'A research laboratory',
    'A supermarket chain',
    'A landscape design company',
    'A construction company',
    'A market research agency',
    'To report on beach conditions',
    'To recognize an employee\'s accomplishments',
    'To explain how a new technology works',
    'condition',
    'will perform',
    'textiles',
    'wood',
    'environment',
    'light'
  ];

  console.log('Testing Google Translate via universalTranslator:');
  for (const s of samples) {
    const vi = await translateText(s);
    console.log(`- "${s}" -> "${vi}"`);
  }
}

testBatch().catch(console.error);
