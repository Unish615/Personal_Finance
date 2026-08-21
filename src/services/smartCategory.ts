export interface CategorySuggestion {
  categoryId: string;
  categoryName: string;
  confidence: number;
}

// Keyword-to-Category mappings (matching default category names)
const RULE_DICTIONARY: Record<string, string[]> = {
  'Food & Dining': [
    'mcdonald', 'kfc', 'burger', 'pizza', 'starbucks', 'cafe', 'restaurant', 
    'dinner', 'lunch', 'breakfast', 'food', 'groceries', 'supermarket', 
    'bakery', 'coffee', 'swiggy', 'zomato', 'bhatbhateni', 'canteen'
  ],
  'Transportation': [
    'uber', 'lyft', 'pathao', 'inDrive', 'taxi', 'cab', 'bus', 'train', 
    'flight', 'airline', 'fuel', 'gas', 'petrol', 'diesel', 'parking', 
    'toll', 'metro', 'fare', 'transit'
  ],
  'Housing': [
    'rent', 'mortgage', 'lease', 'apartment', 'housing', 'property tax', 
    'maintenance fee', 'house repair'
  ],
  'Utilities': [
    'electricity', 'water', 'internet', 'wifi', 'broadband', 'garbage', 
    'trash', 'gas bill', 'nea', 'utility', 'power bill'
  ],
  'Shopping': [
    'amazon', 'shoes', 'clothes', 'clothing', 'fashion', 'mall', 'store', 
    'daraz', 'ebay', 'electronics', 'furniture', 'hardware', 'watch', 'shopping'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'pharmacy', 'medicine', 'clinic', 'dentist', 
    'medical', 'health', 'prescription', 'lab test', 'wellness'
  ],
  'Education': [
    'tuition', 'school', 'college', 'university', 'course', 'udemy', 
    'coursera', 'books', 'stationery', 'exam fee', 'training'
  ],
  'Entertainment': [
    'movie', 'cinema', 'theatre', 'concert', 'game', 'gaming', 'steam', 
    'playstation', 'bowling', 'party', 'ticket', 'pub', 'bar'
  ],
  'Subscriptions': [
    'netflix', 'spotify', 'apple', 'youtube', 'prime', 'hbo', 'disney', 
    'patreon', 'icloud', 'chatgpt', 'github', 'subscription', 'membership'
  ],
  'Personal Care': [
    'salon', 'barber', 'haircut', 'spa', 'cosmetics', 'skincare', 'gym', 
    'fitness', 'grooming'
  ],
  'Salary': [
    'salary', 'paycheck', 'payroll', 'wages', 'monthly income', 'stipend', 'employer'
  ],
  'Freelance': [
    'freelance', 'contract', 'upwork', 'fiverr', 'client payment', 'consulting'
  ],
  'Investment': [
    'dividend', 'stock', 'share', 'crypto', 'bitcoin', 'mutual fund', 'interest', 'real estate'
  ]
};

/**
 * Predicts category based on input description string.
 */
export function suggestCategory(
  description: string, 
  categories: { id: string; name: string; type: 'income' | 'expense' }[]
): CategorySuggestion | null {
  if (!description || description.trim().length < 2) return null;

  const normalized = description.toLowerCase().trim();

  let bestMatch: { categoryName: string; score: number } | null = null;

  for (const [categoryName, keywords] of Object.entries(RULE_DICTIONARY)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        const score = keyword.length / normalized.length + 0.5;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { categoryName, score };
        }
      }
    }
  }

  if (bestMatch) {
    const matchedCategory = categories.find(
      c => c.name.toLowerCase() === bestMatch!.categoryName.toLowerCase()
    );
    if (matchedCategory) {
      return {
        categoryId: matchedCategory.id,
        categoryName: matchedCategory.name,
        confidence: Math.min(Math.round(bestMatch.score * 100), 95)
      };
    }
  }

  return null;
}
