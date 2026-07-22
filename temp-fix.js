const fs = require('fs');

function addOnboardingTooltip(filePath, pageId, title, description) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already added
  if (content.includes('OnboardingTooltip')) {
    console.log(filePath + ': already has OnboardingTooltip');
    return;
  }
  
  // Add import after the last import statement (before the first non-import line)
  // Pattern: the file has imports then a blank line then "const authStore" or similar
  content = content.replace(
    /import \{ checkAILimit \} from '\.\.\/lib\/ai';/,
    "import { checkAILimit } from '../lib/ai';\nimport OnboardingTooltip from '../components/OnboardingTooltip.vue';"
  );
  
  // For files without checkAILimit import, try generic pattern
  if (!content.includes("import OnboardingTooltip")) {
    // Try matching the last import line
    content = content.replace(
      /(import\s+.*?from\s+['"].*?['"];\s*\n)(\s*\n\s*(?:const|let|var|function|interface|type|enum|class|export)\s)/s,
      "$1import OnboardingTooltip from '../components/OnboardingTooltip.vue';\n$2"
    );
  }
  
  // Add component tag before closing </template>
  const tagLine = '    <OnboardingTooltip pageId="' + pageId + '" title="' + title + '" description="' + description + '" />\n';
  
  // Find the closing </template> and the line before it
  content = content.replace(/(\s*)<\/template>/, tagLine + '$1</template>');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(filePath + ': updated');
}

// Process AIChat.vue and Chat.vue
addOnboardingTooltip('src/views/AIChat.vue', 'AIChat', 'AI Yordamchi', 'AI o\'qituvchidan istalgan savolingizga javob oling');
addOnboardingTooltip('src/views/Chat.vue', 'Chat', 'Chat', 'Do\'stlar bilan muloqot qiling va birgalikda test yeching');