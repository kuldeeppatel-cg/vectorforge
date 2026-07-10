/**
 * WhatsApp Chat Log Export Parser Utility
 * Designed to parse both iOS and Android export formats, handle multiline messages,
 * ignore system notifications, and normalize media and deleted messages.
 */

// Android format regex: "10/07/2026, 10:14 - Sender Name: Message content"
const androidRegex = /^(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(.+?):\s(.*)$/;

// iOS format regex: "[10/07/2026, 10:14:05 AM] Sender Name: Message content"
const iosRegex = /^\[(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(.+?):\s(.*)$/;

// System notices (contain dates but no sender colon-space separator)
const androidSysRegex = /^(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*-\s*(.*)$/;
const iosSysRegex = /^\[(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(.*)$/;

/**
 * Parses raw text export lines into a structured JSON array
 * @param {string} textContent - The raw content of the .txt export file
 * @returns {Array<Object>} List of messages: { date, time, sender, message }
 */
export const parseChatLog = (textContent) => {
  if (!textContent) return [];

  const lines = textContent.split(/\r?\n/);
  const messages = [];
  let currentMsg = null;

  for (const line of lines) {
    // Skip completely empty lines
    if (!line) continue;

    // Check if the line is a new message (Android or iOS format)
    const match = line.match(androidRegex) || line.match(iosRegex);

    if (match) {
      const date = match[1];
      const time = match[2];
      const sender = match[3].trim();
      let message = match[4];

      // Handle media omitted formatting
      if (
        message.includes('<Media omitted>') || 
        message.includes('[Media omitted]') || 
        message.includes('<Media-omitted>')
      ) {
        message = '<Media omitted>';
      }

      // Handle deleted messages formatting
      if (
        message.toLowerCase().includes('this message was deleted') ||
        message.toLowerCase().includes('you deleted this message') ||
        message.toLowerCase().includes('message was deleted')
      ) {
        message = 'This message was deleted';
      }

      currentMsg = { date, time, sender, message };
      messages.push(currentMsg);
    } else {
      // Check if it's a system message (contains timestamp but lacks a valid sender)
      const sysMatch = line.match(androidSysRegex) || line.match(iosSysRegex);
      
      if (sysMatch) {
        // Reset currentMsg context to prevent appending multiline content to a prior message
        currentMsg = null;
        continue;
      }

      // If it doesn't match any timestamp structure, treat it as a multiline message continuation
      if (currentMsg) {
        let cleanedLine = line;

        // Apply media/deleted validations on multiline attachments
        if (
          cleanedLine.includes('<Media omitted>') || 
          cleanedLine.includes('[Media omitted]')
        ) {
          cleanedLine = '<Media omitted>';
        }
        if (
          cleanedLine.toLowerCase().includes('this message was deleted') ||
          cleanedLine.toLowerCase().includes('you deleted this message')
        ) {
          cleanedLine = 'This message was deleted';
        }

        currentMsg.message += '\n' + cleanedLine;
      }
    }
  }

  return messages;
};
