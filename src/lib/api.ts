const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: '请求失败' }));
      throw new Error(err.message || '请求失败');
    }
    return res.json();
  } catch {
    throw new Error('网络错误');
  }
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (nickname: string, email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nickname, email, password }),
    }),
  me: () => request<User>('/auth/me'),
};

// Courses
export const courseApi = {
  list: (params?: { language?: string; level?: number }) => {
    const qs = new URLSearchParams();
    if (params?.language) qs.set('language', params.language);
    if (params?.level) qs.set('level', String(params.level));
    return request<Course[]>(`/courses?${qs.toString()}`);
  },
  detail: (id: string) => request<CourseDetail>(`/courses/${id}`),
};

// Learning
export const learningApi = {
  lessonContent: (lessonId: string) => request<LessonContent>(`/learning/lessons/${lessonId}`),
  completeLesson: (lessonId: string, score: number) =>
    request<void>(`/learning/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    }),
  progress: () => request<UserProgress>('/learning/progress'),
};

// Community
export const communityApi = {
  posts: () => request<Post[]>('/community/posts'),
  createPost: (content: string) =>
    request<Post>('/community/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  achievements: () => request<Achievement[]>('/community/achievements'),
};

// Types
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  level: number;
  coverGradient: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  order: number;
  completed: boolean;
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  language: string;
  level: number;
  objectives: string[];
  chapters: Chapter[];
  coverGradient: string;
  progress: number;
}

export interface VocabItem {
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export interface GrammarQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SpeakingContent {
  sentence: string;
  translation: string;
  pronunciation: string;
}

export interface ListeningContent {
  audioUrl: string;
  transcript: string;
  translation: string;
  questions: GrammarQuestion[];
}

export interface LessonContent {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  vocabulary?: VocabItem[];
  grammar?: GrammarQuestion[];
  speaking?: SpeakingContent[];
  listening?: ListeningContent;
}

export interface UserProgress {
  totalXp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  weeklyActivity: number[];
  skills: { listening: number; speaking: number; reading: number; writing: number };
  calendar: Record<string, boolean>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  xp: number;
  timestamp: string;
}

export interface Post {
  id: string;
  author: { id: string; nickname: string; avatar: string };
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'course' | 'skill' | 'social';
  unlocked: boolean;
  unlockedAt?: string;
}

// Mock data fallbacks
export const mockUser: User = {
  id: '1',
  email: 'demo@linguaverse.com',
  nickname: '语言探索者',
  avatar: '',
  level: 5,
  xp: 2400,
  streak: 7,
};

export const mockCourses: Course[] = [
  {
    id: '1',
    title: '英语入门基础',
    description: '从零开始学习英语，掌握基础词汇和语法',
    language: '英语',
    level: 1,
    coverGradient: 'gradient-english',
    progress: 35,
    totalLessons: 24,
    completedLessons: 8,
  },
  {
    id: '2',
    title: '日语五十音图',
    description: '系统学习平假名和片假名，打好日语基础',
    language: '日语',
    level: 1,
    coverGradient: 'gradient-japanese',
    progress: 60,
    totalLessons: 16,
    completedLessons: 10,
  },
  {
    id: '3',
    title: '韩语发音入门',
    description: '学习韩语基本发音规则和常用词汇',
    language: '韩语',
    level: 1,
    coverGradient: 'gradient-korean',
    progress: 15,
    totalLessons: 20,
    completedLessons: 3,
  },
  {
    id: '4',
    title: '英语进阶会话',
    description: '提升英语口语能力，掌握日常对话技巧',
    language: '英语',
    level: 3,
    coverGradient: 'gradient-english',
    progress: 0,
    totalLessons: 30,
    completedLessons: 0,
  },
  {
    id: '5',
    title: '日语N3备考',
    description: '针对日语能力考试N3级别的系统复习',
    language: '日语',
    level: 3,
    coverGradient: 'gradient-japanese',
    progress: 0,
    totalLessons: 36,
    completedLessons: 0,
  },
  {
    id: '6',
    title: '韩语TOPIK初级',
    description: '备考TOPIK初级，全面提升韩语能力',
    language: '韩语',
    level: 2,
    coverGradient: 'gradient-korean',
    progress: 0,
    totalLessons: 28,
    completedLessons: 0,
  },
];

export const mockCourseDetail: CourseDetail = {
  id: '1',
  title: '英语入门基础',
  description: '从零开始学习英语，掌握基础词汇和语法，适合完全没有英语基础的学员。',
  language: '英语',
  level: 1,
  objectives: [
    '掌握500个基础英语词汇',
    '理解基本英语语法结构',
    '能够进行简单日常对话',
    '听懂基础英语听力材料',
  ],
  chapters: [
    {
      id: 'ch1',
      title: '第一章：问候与自我介绍',
      order: 1,
      lessons: [
        { id: 'l1', title: '基础问候语', type: 'vocabulary', order: 1, completed: true },
        { id: 'l2', title: '自我介绍句型', type: 'grammar', order: 2, completed: true },
        { id: 'l3', title: '问候对话练习', type: 'speaking', order: 3, completed: false },
        { id: 'l4', title: '听力：日常问候', type: 'listening', order: 4, completed: false },
      ],
    },
    {
      id: 'ch2',
      title: '第二章：数字与时间',
      order: 2,
      lessons: [
        { id: 'l5', title: '数字词汇', type: 'vocabulary', order: 1, completed: true },
        { id: 'l6', title: '时间表达法', type: 'grammar', order: 2, completed: false },
        { id: 'l7', title: '数字口语练习', type: 'speaking', order: 3, completed: false },
        { id: 'l8', title: '听力：时间对话', type: 'listening', order: 4, completed: false },
      ],
    },
    {
      id: 'ch3',
      title: '第三章：家庭与朋友',
      order: 3,
      lessons: [
        { id: 'l9', title: '家庭成员词汇', type: 'vocabulary', order: 1, completed: false },
        { id: 'l10', title: '关系描述语法', type: 'grammar', order: 2, completed: false },
        { id: 'l11', title: '介绍家人对话', type: 'speaking', order: 3, completed: false },
        { id: 'l12', title: '听力：家庭话题', type: 'listening', order: 4, completed: false },
      ],
    },
  ],
  coverGradient: 'gradient-english',
  progress: 35,
};

export const mockLessonContent: Record<string, LessonContent> = {
  l1: {
    id: 'l1',
    title: '基础问候语',
    type: 'vocabulary',
    vocabulary: [
      { word: 'Hello', translation: '你好', pronunciation: '/həˈloʊ/', example: 'Hello, how are you?', exampleTranslation: '你好，你怎么样？' },
      { word: 'Good morning', translation: '早上好', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/', example: 'Good morning, everyone!', exampleTranslation: '大家早上好！' },
      { word: 'Good evening', translation: '晚上好', pronunciation: '/ɡʊd ˈiːvnɪŋ/', example: 'Good evening, sir.', exampleTranslation: '先生，晚上好。' },
      { word: 'Goodbye', translation: '再见', pronunciation: '/ɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!', exampleTranslation: '再见，明天见！' },
      { word: 'Thank you', translation: '谢谢', pronunciation: '/θæŋk juː/', example: 'Thank you very much!', exampleTranslation: '非常感谢！' },
    ],
  },
  l2: {
    id: 'l2',
    title: '自我介绍句型',
    type: 'grammar',
    grammar: [
      {
        question: '"我叫Tom"用英语怎么说？',
        options: ['My name is Tom', 'I name Tom', 'I am name Tom', 'Me is Tom'],
        correctIndex: 0,
        explanation: '"My name is..." 是标准的自我介绍句型，表示"我的名字是..."。',
      },
      {
        question: '"我来自中国"的正确表达是？',
        options: ['I come China', 'I from China', 'I am from China', 'I come of China'],
        correctIndex: 2,
        explanation: '"I am from..." 或 "I come from..." 表示"我来自..."，注意介词的搭配。',
      },
      {
        question: '"很高兴认识你"用英语怎么说？',
        options: ['Nice meet you', 'Nice to meet you', 'Good to know you', 'Happy meet you'],
        correctIndex: 1,
        explanation: '"Nice to meet you" 是初次见面时的常用语，注意不定式符号 "to" 不可省略。',
      },
    ],
  },
  l3: {
    id: 'l3',
    title: '问候对话练习',
    type: 'speaking',
    speaking: [
      { sentence: 'Hello! My name is Li Ming. Nice to meet you!', translation: '你好！我叫李明。很高兴认识你！', pronunciation: '/həˈloʊ! maɪ neɪm ɪz liː mɪŋ. naɪs tuː miːt juː!/' },
      { sentence: 'Good morning! How are you today?', translation: '早上好！你今天怎么样？', pronunciation: '/ɡʊd ˈmɔːrnɪŋ! haʊ ɑːr juː təˈdeɪ?/' },
      { sentence: 'I am fine, thank you. And you?', translation: '我很好，谢谢。你呢？', pronunciation: '/aɪ æm faɪn, θæŋk juː. ænd juː?/' },
    ],
  },
  l4: {
    id: 'l4',
    title: '听力：日常问候',
    type: 'listening',
    listening: {
      audioUrl: '',
      transcript: 'A: Hello! How are you? B: I am fine, thank you. And you? A: I am great! Nice to meet you. B: Nice to meet you too!',
      translation: 'A: 你好！你怎么样？ B: 我很好，谢谢。你呢？ A: 我很好！很高兴认识你。 B: 我也很高兴认识你！',
      questions: [
        {
          question: '对话中B的回答是什么？',
          options: ['I am fine, thank you', 'I am great', 'I am sorry', 'I am tired'],
          correctIndex: 0,
          explanation: 'B的回答是"I am fine, thank you"，表示"我很好，谢谢"。',
        },
      ],
    },
  },
};

export const mockProgress: UserProgress = {
  totalXp: 2400,
  level: 5,
  streak: 7,
  lessonsCompleted: 21,
  weeklyActivity: [3, 5, 2, 4, 6, 1, 3],
  skills: { listening: 65, speaking: 45, reading: 78, writing: 52 },
  calendar: {
    '2026-06-01': true, '2026-06-02': true, '2026-06-03': false,
    '2026-06-04': true, '2026-06-05': true, '2026-06-06': false,
    '2026-06-07': true, '2026-06-08': true, '2026-06-09': true,
    '2026-06-10': true, '2026-06-11': true, '2026-06-12': true,
  },
  recentActivity: [
    { id: '1', type: 'lesson', title: '完成「基础问候语」', xp: 50, timestamp: '2026-06-12T10:00:00Z' },
    { id: '2', type: 'streak', title: '连续学习7天', xp: 100, timestamp: '2026-06-12T09:00:00Z' },
    { id: '3', type: 'lesson', title: '完成「自我介绍句型」', xp: 50, timestamp: '2026-06-11T15:00:00Z' },
  ],
};

export const mockPosts: Post[] = [
  { id: '1', author: { id: '2', nickname: '日语达人', avatar: '' }, content: '今天终于把五十音图全部记住了！加油！🎉', likes: 12, comments: 3, timestamp: '2026-06-12T08:00:00Z' },
  { id: '2', author: { id: '3', nickname: '英语爱好者', avatar: '' }, content: '分享一个记忆单词的好方法：联想记忆法，把新单词和生活中的事物联系起来，效果超好！', likes: 25, comments: 8, timestamp: '2026-06-11T20:00:00Z' },
  { id: '3', author: { id: '4', nickname: '韩语新手', avatar: '' }, content: '韩语发音真的好难啊，有没有小伙伴一起练习？', likes: 8, comments: 5, timestamp: '2026-06-11T14:00:00Z' },
];

export const mockAchievements: Achievement[] = [
  { id: '1', name: '初出茅庐', description: '完成第一节课', icon: '🎯', category: 'course', unlocked: true, unlockedAt: '2026-05-01' },
  { id: '2', name: '七日之约', description: '连续学习7天', icon: '🔥', category: 'streak', unlocked: true, unlockedAt: '2026-06-12' },
  { id: '3', name: '词汇达人', description: '学习100个词汇', icon: '📚', category: 'skill', unlocked: true, unlockedAt: '2026-05-15' },
  { id: '4', name: '社交蝴蝶', description: '在社区发表10条动态', icon: '🦋', category: 'social', unlocked: false },
  { id: '5', name: '月度之星', description: '连续学习30天', icon: '⭐', category: 'streak', unlocked: false },
  { id: '6', name: '语法大师', description: '完成所有语法练习', icon: '✍️', category: 'skill', unlocked: false },
  { id: '7', name: '听力高手', description: '听力测试满分', icon: '🎧', category: 'skill', unlocked: false },
  { id: '8', name: '课程毕业', description: '完成一整门课程', icon: '🎓', category: 'course', unlocked: false },
];
