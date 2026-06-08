// 静态文案的唯一来源：个人资料、Widget、分类、社交链接。
// V1 静态；后续 profile / widgets / categories / links 可由后台数据覆盖。

export const PANOS_PROFILE = {
  name: "潘廷峰",
  englishName: "Pan Daniel",
  subtitle: "欢迎来到小潘同学的个人创作空间",
  currentMode: "Building",
  intro: "我正在探索 AI Agent、个人产品、Web 开发和内容创作之间的连接方式。",
  roles: ["AI Agent Researcher", "Web Builder", "Product Explorer", "Content Creator"],
  focus: ["Agent Memory", "Tool Retrieval", "Personal AI Products", "Creative Coding"],
};

export const PANOS_WIDGETS = [
  {
    title: "Now",
    lines: ["正在研究：Agent Memory", "正在开发：PanOS", "正在整理：个人创作空间"],
  },
  {
    title: "Status",
    lines: ["Building", "Thinking", "Writing"],
  },
  {
    title: "Quote",
    lines: ["把还没成型的想法，慢慢做成真实的东西。"],
  },
];

export const ARTICLE_CATEGORIES = [
  "All Articles",
  "AI & Agent",
  "Web Development",
  "Product Thinking",
  "Entrepreneurship",
  "Life Notes",
  "Essays",
];

export const PROJECT_CATEGORIES = [
  "AI Projects",
  "Web Apps",
  "Product Experiments",
  "Research Tools",
  "Content Experiments",
];

export const GALLERY_CATEGORIES = [
  "Photography",
  "AI Images",
  "UI Design",
  "Posters",
  "Screenshots",
  "Visual Experiments",
];

export const SOCIAL_LINKS = [
  {
    platform: "GitHub",
    description: "My code, experiments, and open-source projects.",
    slug: "github",
  },
  {
    platform: "小红书",
    description: "内容创作、产品观察和生活切片。",
    slug: "xiaohongshu",
  },
  {
    platform: "Email",
    description: "研究交流、项目合作和内容共创。",
    slug: "email",
  },
];
