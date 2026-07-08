// ============================================================
// config/constants.js  --  Central configuration file
// ============================================================

export const DEFAULT_MODEL   = "gpt4";
export const ENABLE_RESEARCH = false;
export const QUOTE_DURATION  = 8000;

export const MODES = [
  { id: "linkedin",  label: "LinkedIn Post",     icon: "💼", desc: "Professional hook, bullet insights & CTA",  color: "#0A66C2" },
  { id: "blog",      label: "Blog Article",      icon: "✍️", desc: "SEO-optimised long-form with structure",    color: "#16a34a" },
  { id: "email",     label: "Email Campaign",    icon: "📧", desc: "Subject line, body copy & sign-off",        color: "#dc2626" },
  { id: "ad",        label: "Ad Copy",           icon: "📣", desc: "PAS framework with punchy headline & CTA",  color: "#d97706" },
  { id: "tweet",     label: "Tweet / X Post",    icon: "🐦", desc: "Sharp, punchy — under 280 characters",     color: "#1DA1F2" },
  { id: "instagram", label: "Instagram Caption", icon: "📸", desc: "Visual caption with hashtags & CTA",       color: "#E1306C" },
];

export const WORD_DEFAULTS = {
  linkedin:  150,
  blog:      600,
  email:     200,
  ad:        100,
  tweet:     60,
  instagram: 120,
};

// Advanced fields per content type
// Each field: { id, label, type: "chips"|"input"|"select", options?, placeholder? }
export const ADVANCED_FIELDS = {
  linkedin: [
    {
      id: "post_goal",
      label: "Post Goal",
      type: "chips",
      options: ["Build Authority", "Share Insight", "Tell a Story", "Announce News",
                "Promote Product", "Job Seeking", "Ask Community"],
      default: "Build Authority",
    },
    {
      id: "hook_style",
      label: "Opening Hook Style",
      type: "chips",
      options: ["Bold Statement", "Surprising Stat", "Personal Story",
                "Question", "Controversial Take", "Listicle Opener"],
      default: "Bold Statement",
    },
    {
      id: "post_structure",
      label: "Post Structure",
      type: "chips",
      options: ["Hook + Story + Lesson", "Problem + Solution", "Before + After",
                "Numbered Tips", "Single Insight Deep Dive"],
      default: "Hook + Story + Lesson",
    },
    {
      id: "industry",
      label: "Industry / Niche",
      type: "input",
      placeholder: "e.g. SaaS, Healthcare, Finance...",
      default: "",
    },
    {
      id: "hashtag_count",
      label: "Hashtags",
      type: "chips",
      options: ["3", "5", "7", "None"],
      default: "5",
    },
  ],
  blog: [
    {
      id: "blog_type",
      label: "Blog Type",
      type: "chips",
      options: ["How-To Guide", "Listicle", "Opinion / Editorial", "Case Study",
                "Explainer", "Comparison", "Interview Style"],
      default: "How-To Guide",
    },
    {
      id: "seo_focus",
      label: "SEO Focus Keyword",
      type: "input",
      placeholder: "e.g. machine learning for beginners",
      default: "",
    },
    {
      id: "reading_level",
      label: "Reading Level",
      type: "chips",
      options: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    {
      id: "cta_type",
      label: "Call to Action",
      type: "chips",
      options: ["Subscribe", "Read More", "Download", "Contact Us", "None"],
      default: "Subscribe",
    },
    {
      id: "meta_description",
      label: "Include Meta Description",
      type: "chips",
      options: ["Yes", "No"],
      default: "Yes",
    },
  ],
  email: [
    {
      id: "email_type",
      label: "Email Type",
      type: "chips",
      options: ["Cold Outreach", "Newsletter", "Product Launch", "Follow-Up",
                "Welcome Email", "Re-engagement", "Promotional"],
      default: "Newsletter",
    },
    {
      id: "subject_style",
      label: "Subject Line Style",
      type: "chips",
      options: ["Question", "Curiosity Gap", "Benefit-Led", "Personalised",
                "Urgency / FOMO", "Direct"],
      default: "Benefit-Led",
    },
    {
      id: "email_length",
      label: "Email Length",
      type: "chips",
      options: ["Very Short (50-100w)", "Short (100-200w)", "Medium (200-400w)", "Long (400w+)"],
      default: "Short (100-200w)",
    },
    {
      id: "cta_placement",
      label: "CTA Placement",
      type: "chips",
      options: ["Top", "Middle", "Bottom", "Multiple"],
      default: "Bottom",
    },
    {
      id: "personalization",
      label: "Personalization Token",
      type: "input",
      placeholder: "e.g. {first_name}, {company}",
      default: "{first_name}",
    },
  ],
  ad: [
    {
      id: "ad_format",
      label: "Ad Framework",
      type: "chips",
      options: ["PAS (Problem-Agitate-Solve)", "AIDA", "FAB", "4Ps", "Before-After-Bridge"],
      default: "PAS (Problem-Agitate-Solve)",
    },
    {
      id: "ad_platform",
      label: "Ad Platform",
      type: "chips",
      options: ["Google Ads", "Facebook / Instagram", "LinkedIn Ads",
                "Twitter / X Ads", "YouTube", "General"],
      default: "General",
    },
    {
      id: "product_benefit",
      label: "Key Benefit / USP",
      type: "input",
      placeholder: "e.g. saves 10 hours a week",
      default: "",
    },
    {
      id: "cta_style",
      label: "CTA Style",
      type: "chips",
      options: ["Shop Now", "Learn More", "Get Started", "Try Free",
                "Book a Demo", "Download Now"],
      default: "Get Started",
    },
    {
      id: "ad_pain_point",
      label: "Target Pain Point",
      type: "input",
      placeholder: "e.g. wasting time on manual tasks",
      default: "",
    },
  ],
  tweet: [
    {
      id: "tweet_style",
      label: "Tweet Style",
      type: "chips",
      options: ["Hot Take", "Thread Opener", "Question", "Insight", "Rant",
                "Motivational", "Funny / Witty"],
      default: "Insight",
    },
    {
      id: "tweet_hook",
      label: "Opening Hook",
      type: "chips",
      options: ["Contrarian Statement", "Surprising Fact", "Personal Story",
                "Bold Claim", "Direct Question"],
      default: "Bold Claim",
    },
    {
      id: "hashtag_count",
      label: "Hashtags",
      type: "chips",
      options: ["0", "1", "2", "3"],
      default: "1",
    },
    {
      id: "thread",
      label: "Format as Thread",
      type: "chips",
      options: ["Single Tweet", "3-Tweet Thread", "5-Tweet Thread"],
      default: "Single Tweet",
    },
  ],
  instagram: [
    {
      id: "caption_style",
      label: "Caption Style",
      type: "chips",
      options: ["Storytelling", "Educational", "Motivational", "Product Showcase",
                "Behind the Scenes", "Question + Engage"],
      default: "Storytelling",
    },
    {
      id: "hashtag_count",
      label: "Hashtag Count",
      type: "chips",
      options: ["5", "10", "15", "20", "30"],
      default: "10",
    },
    {
      id: "hashtag_mix",
      label: "Hashtag Mix",
      type: "chips",
      options: ["Niche Only", "Broad + Niche", "Trending + Niche", "Brand Only"],
      default: "Broad + Niche",
    },
    {
      id: "cta_type",
      label: "CTA Type",
      type: "chips",
      options: ["Link in Bio", "Comment Below", "Tag a Friend", "Save This Post",
                "DM for Info", "None"],
      default: "Link in Bio",
    },
    {
      id: "visual_description",
      label: "Describe the Visual / Image",
      type: "input",
      placeholder: "e.g. flat lay of coffee and laptop, sunset at beach...",
      default: "",
    },
  ],
};

export const TONES = [
  { id: "Professional",   emoji: "🏢" },
  { id: "Casual",         emoji: "😊" },
  { id: "Authoritative",  emoji: "🎯" },
  { id: "Conversational", emoji: "💬" },
  { id: "Witty",          emoji: "✨" },
  { id: "Inspirational",  emoji: "🚀" },
  { id: "Technical",      emoji: "⚙️" },
  { id: "Persuasive",     emoji: "💡" },
];

export const AUDIENCES = [
  "General Public", "AI Developers", "Tech Leads", "Business Executives",
  "Startup Founders", "Marketing Teams", "Students & Researchers", "Product Managers",
];

export const ROLES = [
  "General", "Student", "Teacher / Faculty", "Developer",
  "Manager", "Entrepreneur", "Marketer", "Researcher",
];

export const LANGUAGES = [
  "Spanish", "French", "German", "Hindi", "Arabic", "Portuguese",
  "Italian", "Japanese", "Korean", "Chinese (Simplified)", "Russian",
  "Dutch", "Turkish", "Bengali", "Tamil", "Telugu", "Marathi",
  "Kannada", "Gujarati", "Punjabi", "Urdu", "Malayalam",
];

export const WORD_LIMIT = { min: 50, max: 800, step: 25, default: 150 };

export const LOADING_QUOTES = [
  { quote: "The first draft is just you telling yourself the story.",                               author: "Terry Pratchett" },
  { quote: "Content is king, but engagement is queen — and the queen runs the household.",          author: "Mari Smith" },
  { quote: "Either write something worth reading or do something worth writing.",                   author: "Benjamin Franklin" },
  { quote: "Good content isn't about good storytelling. It's about telling a true story well.",     author: "Ann Handley" },
  { quote: "Marketing is no longer about the stuff that you make, but the stories you tell.",       author: "Seth Godin" },
  { quote: "The art of communication is the language of leadership.",                               author: "James Humes" },
  { quote: "Your brand is what other people say about you when you're not in the room.",            author: "Jeff Bezos" },
  { quote: "Simplicity is the ultimate sophistication.",                                            author: "Leonardo da Vinci" },
  { quote: "Creativity is intelligence having fun.",                                                author: "Albert Einstein" },
  { quote: "In the age of information, storytelling is the most powerful tool you have.",           author: "Robert McKee" },
];

export const API_ENDPOINT = "http://localhost:8000/generate";
