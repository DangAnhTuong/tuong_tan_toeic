import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Critical identifiers that MUST be imported if used in code
const CRITICAL_IMPORTS = [
  { name: 'getStoredUser', module: 'auth' },
  { name: 'setStoredUser', module: 'auth' },
  { name: 'clearStoredUser', module: 'auth' },
  { name: 'getAuthToken', module: 'auth' },
  { name: 'useAuth', module: 'AuthContext' },
  { name: 'useTheme', module: 'ThemeContext' },
  { name: 'useDictionary', module: 'DictionaryContext' },
  { name: 'usePageTitle', module: 'usePageTitle' },
  { name: 'useStudyTime', module: 'useStudyTime' },
  { name: 'reconcileStudyTimeWithServer', module: 'studyTimeTracker' },
  { name: 'translateToeicOption', module: 'toeicTranslator' },
  { name: 'translateToeicScript', module: 'toeicTranslator' },
  { name: 'extractVocabRecommendations', module: 'toeicTranslator' },
  { name: 'PricingModal', module: 'PricingModal' },
  { name: 'VipLockOverlay', module: 'VipLockOverlay' },
  { name: 'VocabularyDrawer', module: 'VocabularyDrawer' },
  { name: 'ExitModal', module: 'ExitModal' },
  { name: 'DauSavingProgressOverlay', module: 'DauSavingProgressOverlay' },
  { name: 'getPracticeProgress', module: 'practiceProgressService' },
  { name: 'savePracticeProgress', module: 'practiceProgressService' },
  { name: 'resetPracticeProgress', module: 'practiceProgressService' },
  { name: 'getBasketWords', module: 'vocabBasketService' },
  { name: 'addWordToBasket', module: 'vocabBasketService' },
  { name: 'removeWordFromBasket', module: 'vocabBasketService' }
];

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

console.log('🔍 [VALIDATOR] Scanning frontend/src for missing critical imports...');
const allFiles = getAllFiles(srcDir);
let errorCount = 0;

for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relPath = path.relative(srcDir, filePath);

  for (const item of CRITICAL_IMPORTS) {
    // Check if the file is the definer itself (e.g. auth.js defines getStoredUser)
    if (filePath.toLowerCase().includes(item.module.toLowerCase() + '.js') || 
        filePath.toLowerCase().includes(item.module.toLowerCase() + '.jsx')) {
      continue;
    }

    // Pattern to check usage as identifier: word boundary, not preceded by '.'
    const usageRegex = new RegExp(`(?<![.\\w])${item.name}(?![\\w])`, 'g');
    const importRegex = new RegExp(`import\\s+[\\s\\S]*?\\b${item.name}\\b[\\s\\S]*?from`, 'm');

    const lines = content.split('\n');
    let imported = importRegex.test(content);

    // Also check if declared locally (e.g. const getStoredUser = ...)
    const localDeclRegex = new RegExp(`(?:const|let|var|function)\\s+${item.name}\\b`);
    let locallyDeclared = localDeclRegex.test(content);

    if (imported || locallyDeclared) continue;

    // Search for usage in lines (skip import statements and comments)
    let foundLine = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) continue;
      if (usageRegex.test(line)) {
        foundLine = i + 1;
        break;
      }
    }

    if (foundLine !== -1) {
      console.error(`❌ [IMPORT_ERROR] ${relPath}:${foundLine} -> '${item.name}' is used but NOT imported!`);
      errorCount++;
    }
  }
}

if (errorCount > 0) {
  console.error(`\n🚨 FOUND ${errorCount} UNIMPORTED CRITICAL IDENTIFIER(S). ABORTING BUILD/DEPLOY!`);
  process.exit(1);
} else {
  console.log(`✅ [VALIDATOR] All ${allFiles.length} files passed critical import checks. 0 missing imports found.\n`);
  process.exit(0);
}
