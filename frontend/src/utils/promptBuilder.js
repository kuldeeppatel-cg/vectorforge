/**
 * Compiles a system prompt using a customizable prompt template
 * 
 * @param {string} userName - The name of the sender being cloned
 * @param {Object} styleAnalysis - The style analysis result
 * @param {Array<Object>} messagePairs - Extracted incoming-reply message pairs
 * @param {string} template - Raw custom prompt template from settings
 * @returns {string} System prompt
 */
export const buildSystemPrompt = (userName, styleAnalysis, messagePairs, template) => {
  // Format few-shot conversational pairs
  let messageSamplesText = '';
  const maxPairs = 10;
  const selectedPairs = messagePairs.slice(0, maxPairs);

  if (selectedPairs.length > 0) {
    selectedPairs.forEach((pair, index) => {
      messageSamplesText += `Example ${index + 1}:\n`;
      messageSamplesText += `Incoming: "${pair.incoming}"\n`;
      messageSamplesText += `${userName}: "${pair.reply}"\n\n`;
    });
  } else {
    messageSamplesText = 'No message samples available.\n';
  }

  // Inject target values into template variables
  let prompt = template || '';
  
  // Support variations in spacing (e.g. {{user_name}} or {{ user_name }})
  prompt = prompt.replace(/\{\{\s*user_name\s*\}\}/g, userName);
  prompt = prompt.replace(/\{\{\s*message_samples\s*\}\}/g, messageSamplesText);

  return prompt;
};
