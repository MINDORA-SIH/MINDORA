export function normalizeText(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');
}

export function removeFillerWords(text: string, lang: string): string {
  let fillers: string[] = [];

  switch (lang.toLowerCase()) {
    case 'en':
      fillers = ['please', 'can you', 'could you', 'i want to', 'take me to', 'show me', 'open', 'go to', 'a', 'the', 'an'];
      break;
    case 'hi':
      fillers = ['कृपया', 'मुझे', 'मैं चाहता हूं', 'दिखाओ', 'खोलो', 'पर जाओ', 'को'];
      break;
    case 'as':
      fillers = ['অনুগ্ৰহ কৰি', 'মোক', 'খোলক', 'যাওক'];
      break;
    case 'bn':
      fillers = ['দয়া করে', 'অনুগ্রহ করে', 'আমাকে', 'খুলুন', 'যান'];
      break;
    case 'ne':
      fillers = ['कृपया', 'मलाई', 'देखाउनुहोस्', 'खोल्नुहोस्'];
      break;
    default:
      fillers = [];
      break;
  }

  let cleaned = text;
  for (const filler of fillers) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  }
  
  return cleaned.replace(/\s{2,}/g, ' ').trim();
}
