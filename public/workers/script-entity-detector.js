// Web Worker for script entity detection
// This prevents blocking the UI during heavy text processing

self.onmessage = function(e) {
  const { text, type } = e.data;
  
  if (type === 'detect_entities') {
    // Simulate entity detection processing
    const entities = detectEntities(text);
    
    self.postMessage({
      type: 'entities_detected',
      entities: entities,
      text: text
    });
  }
};

function detectEntities(text) {
  // Simple entity detection patterns
  const entities = {
    characters: [],
    locations: [],
    objects: [],
    actions: []
  };
  
  // Character detection (names starting with capital letters)
  const characterPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const characterMatches = text.match(characterPattern) || [];
  entities.characters = [...new Set(characterMatches)];
  
  // Location detection (words like "in the", "at the", etc.)
  const locationPattern = /\b(?:in|at|on|near|by)\s+the\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const locationMatches = [];
  let match;
  while ((match = locationPattern.exec(text)) !== null) {
    locationMatches.push(match[1]);
  }
  entities.locations = [...new Set(locationMatches)];
  
  // Action detection (verbs in present tense)
  const actionPattern = /\b(?:walks|runs|jumps|sits|stands|looks|sees|hears|says|shouts|whispers)\b/g;
  const actionMatches = text.match(actionPattern) || [];
  entities.actions = [...new Set(actionMatches)];
  
  // Object detection (common objects)
  const objectPattern = /\b(?:door|window|table|chair|book|phone|car|house|tree|flower)\b/g;
  const objectMatches = text.match(objectPattern) || [];
  entities.objects = [...new Set(objectMatches)];
  
  return entities;
}
