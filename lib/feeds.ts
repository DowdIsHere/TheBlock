export type FeedCategory = 'brain' | 'mental' | 'gut' | 'holistic'

export const CATEGORY_LABELS: Record<FeedCategory, string> = {
  brain: 'Brain & Cognition',
  mental: 'Mental Health',
  gut: 'Gut & Microbiome',
  holistic: 'Whole-Body Wellness',
}

export const CATEGORY_DESCRIPTIONS: Record<FeedCategory, string> = {
  brain: 'Memory, aging, neuroplasticity, dementia and Alzheimer\'s research.',
  mental: 'Anxiety, mood, addiction, child & adolescent mental health, clinical updates.',
  gut: 'Gut microbiome research, probiotics, digestion, gut-organ axes.',
  holistic: 'Diet, sleep, stress resilience, gut-brain axis, lifestyle medicine.',
}

export interface Feed {
  name: string
  url: string
  category: FeedCategory
}

// Curated list of sources that publish a public RSS or Atom feed.
// Sites without RSS (ZOE, Innova, Verywell Mind, Calm Sage, ADDitude is RSS,
// Cognitive Vitality, Sunday Health, etc.) are intentionally omitted —
// scraping them is fragile and risks ToS issues.
export const FEEDS: Feed[] = [
  // Brain & Cognition
  { name: 'ScienceDaily — Mind & Brain', url: 'https://www.sciencedaily.com/rss/mind_brain.xml', category: 'brain' },
  { name: 'ScienceDaily — Alzheimer\'s', url: 'https://www.sciencedaily.com/rss/mind_brain/alzheimer_s.xml', category: 'brain' },
  { name: 'ScienceDaily — Dementia', url: 'https://www.sciencedaily.com/rss/mind_brain/dementia.xml', category: 'brain' },
  { name: 'ScienceDaily — Memory', url: 'https://www.sciencedaily.com/rss/mind_brain/memory.xml', category: 'brain' },
  { name: 'Neuroscience News', url: 'https://neurosciencenews.com/feed/', category: 'brain' },
  { name: 'Harvard Health Blog', url: 'https://www.health.harvard.edu/blog/feed', category: 'brain' },
  { name: 'NIA News', url: 'https://www.nia.nih.gov/news/feed', category: 'brain' },
  { name: 'Nature Neuroscience', url: 'https://www.nature.com/neuro.rss', category: 'brain' },
  { name: 'Frontiers in Aging Neuroscience', url: 'https://www.frontiersin.org/journals/aging-neuroscience/rss', category: 'brain' },

  // Mental & Emotional Health
  { name: 'NIMH', url: 'https://www.nimh.nih.gov/news/science-news/rss', category: 'mental' },
  { name: 'Psychiatric Times', url: 'https://www.psychiatrictimes.com/rss', category: 'mental' },
  { name: 'NPR — Mental Health', url: 'https://feeds.npr.org/1128/rss.xml', category: 'mental' },
  { name: 'Child Mind Institute', url: 'https://childmind.org/feed/', category: 'mental' },
  { name: 'ADDitude Magazine', url: 'https://www.additudemag.com/feed/', category: 'mental' },
  { name: 'The Lancet Psychiatry', url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', category: 'mental' },
  { name: 'MindSite News', url: 'https://mindsitenews.org/feed/', category: 'mental' },

  // Gut & Microbiome
  { name: 'ScienceDaily — Microbiome', url: 'https://www.sciencedaily.com/rss/health_medicine/microbes_and_more.xml', category: 'gut' },
  { name: 'Medical Xpress — Microbiology', url: 'https://medicalxpress.com/rss-feed/biology-news/microbiology/', category: 'gut' },
  { name: 'Nature Microbiology', url: 'https://www.nature.com/nmicrobiol.rss', category: 'gut' },

  // Holistic / Whole-Body
  { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml', category: 'holistic' },
  { name: 'ScienceDaily — Health & Medicine', url: 'https://www.sciencedaily.com/rss/health_medicine.xml', category: 'holistic' },
  { name: 'ScienceDaily — Diet & Weight Loss', url: 'https://www.sciencedaily.com/rss/health_medicine/diet_and_weight_loss.xml', category: 'holistic' },
]
