const { translateText } = require('../utils/universalTranslator');
const { translateToeicPrompt } = require('../utils/toeicPromptTranslator');

async function testPromptHealing() {
  const samples = [
    'How was Ms. Varga offered her new job?',
    'What is true about the trip Ms. Adeyemi will take?',
    'What does the advertisement suggest about autumn?',
    'What will Mr. Moss most likely encourage Ms. Clark to do?',
    'What is the purpose of the programme?',
    'According to the article, what can visitors to Ms. Karimi\'s Web site do?',
    'What does the Web page indicate about Halcyon Studio?',
    'What do both companies offer to customers?',
    'Ms. Carpenter will be attending the conference with ------- marketing team.',
    'According to the department head, ------ are ready to begin work on the Arborney Bridge project.'
  ];

  console.log('Testing prompt translations:');
  for (const s of samples) {
    let trans = translateToeicPrompt(s);
    if (!trans || /\b(what|why|who|when|where|which|how|her new job)\b/i.test(trans)) {
      trans = await translateText(s, true);
    }
    console.log(`EN: "${s}"`);
    console.log(`VI: "${trans}"\n`);
  }
}

testPromptHealing().catch(console.error);
