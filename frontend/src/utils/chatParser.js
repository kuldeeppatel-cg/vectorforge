/**
 * Parses the raw text content of a WhatsApp chat export file (.txt)
 * Supports both Android and iOS formats:
 * - Android: DD/MM/YYYY, HH:MM - Sender: Message
 * - Android Alt: DD/MM/YY, HH:MM - Sender: Message
 * - Android US: MM/DD/YY, HH:MM AM/PM - Sender: Message
 * - iOS: [DD/MM/YYYY, HH:MM:SS] Sender: Message
 * - iOS Alt: [DD/MM/YY, HH:MM:SS] Sender: Message
 * 
 * @param {string} fileContent - Raw text content from the file
 * @returns {Array<Object>} List of parsed messages
 */
export const parseChatText = (fileContent) => {
  const lines = fileContent.split(/\r?\n/);
  const messages = [];
  
  // Regular expressions to detect message starts
  // 1. Android: "15/06/2024, 18:32 - Name: Msg" or "6/15/24, 6:32 PM - Name: Msg"
  const androidRegex = /^(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s+-\s+([^:]+):\s+(.*)$/;
  
  // 2. iOS: "[15/06/2024, 18:32:05] Name: Msg" or "[6/15/24, 6:32:05 PM] Name: Msg"
  const iosRegex = /^\[(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s+([^:]+):\s+(.*)$/;

  let currentMessage = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    let match = line.match(androidRegex) || line.match(iosRegex);

    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const dateStr = match[1];
      const timeStr = match[2];
      const sender = match[3].trim();
      const content = match[4].trim();

      // Filter out system events (status changes, security encryptions, etc)
      if (
        sender.includes('added') || 
        sender.includes('created group') || 
        sender.includes('changed the group') ||
        content.includes('Messages and calls are end-to-end encrypted') ||
        content.includes('omitted')
      ) {
        currentMessage = null;
        continue;
      }

      currentMessage = {
        dateStr,
        timeStr,
        sender,
        content
      };
    } else {
      // Line continuation for multi-line messages
      if (currentMessage) {
        currentMessage.content += '\n' + line.trim();
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  // Filter media omission alerts
  return messages.filter(msg => {
    const isMedia = /<Media omitted>|<media omitted>|image omitted|video omitted|sticker omitted/i.test(msg.content);
    const isSecurity = /end-to-end encrypted/i.test(msg.content);
    return !isMedia && !isSecurity;
  });
};

/**
 * Extracts unique participants from parsed messages
 */
export const getParticipants = (messages) => {
  const senders = new Set();
  messages.forEach(msg => {
    if (msg.sender) senders.add(msg.sender);
  });
  return Array.from(senders);
};

/**
 * Generates turn-by-turn reply pairs for a specific target sender
 */
export const generateReplyPairs = (messages, targetSender) => {
  const pairs = [];
  
  for (let i = 1; i < messages.length; i++) {
    const currentMsg = messages[i];
    
    if (currentMsg.sender === targetSender) {
      const prevMsg = messages[i - 1];
      
      if (prevMsg.sender !== targetSender) {
        pairs.push({
          incomingSender: prevMsg.sender,
          incoming: prevMsg.content,
          reply: currentMsg.content
        });
      }
    }
  }
  
  return pairs;
};
