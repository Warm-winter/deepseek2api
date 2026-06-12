import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'

const db = new Database(':memory:')

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    language TEXT NOT NULL CHECK(language IN ('en', 'ja', 'ko')),
    level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 5),
    cover_image TEXT,
    total_lessons INTEGER DEFAULT 0
  );

  CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    title TEXT NOT NULL,
    order_num INTEGER NOT NULL
  );

  CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_id INTEGER NOT NULL REFERENCES chapters(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('vocabulary', 'grammar', 'speaking', 'listening')),
    order_num INTEGER NOT NULL,
    content TEXT NOT NULL
  );

  CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    UNIQUE(user_id, lesson_id)
  );

  CREATE TABLE user_courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    course_id INTEGER NOT NULL REFERENCES courses(id),
    completed_lessons INTEGER DEFAULT 0,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
  );

  CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT CHECK(category IN ('streak', 'course', 'skill', 'social'))
  );

  CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
  );

  CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Seed data
const insertUser = db.prepare(`
  INSERT INTO users (email, password_hash, nickname, avatar, level, xp, streak, longest_streak)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const hashPassword = bcrypt.hashSync('demo123', 10)
insertUser.run('demo@linguaverse.com', hashPassword, '学习达人', '', 5, 1200, 7, 14)

// Seed courses
const insertCourse = db.prepare(`
  INSERT INTO courses (title, description, language, level, cover_image, total_lessons)
  VALUES (?, ?, ?, ?, ?, ?)
`)

const coursesData = [
  { title: '英语入门', description: '从零开始学习英语，掌握基础词汇和语法', language: 'en', level: 1, cover_image: '/courses/en-beginner.png', total_lessons: 8 },
  { title: '英语进阶', description: '提升英语能力，学习更复杂的表达和语法结构', language: 'en', level: 3, cover_image: '/courses/en-advanced.png', total_lessons: 9 },
  { title: '日语基础', description: '学习日语五十音图和基础会话', language: 'ja', level: 1, cover_image: '/courses/ja-beginner.png', total_lessons: 8 },
  { title: '日语进阶', description: '深入学习日语语法和敬语表达', language: 'ja', level: 3, cover_image: '/courses/ja-advanced.png', total_lessons: 8 },
  { title: '韩语入门', description: '学习韩语字母和基础日常用语', language: 'ko', level: 1, cover_image: '/courses/ko-beginner.png', total_lessons: 8 },
  { title: '韩语中级', description: '提升韩语水平，学习更多实用表达', language: 'ko', level: 2, cover_image: '/courses/ko-intermediate.png', total_lessons: 8 },
]

const courseIds: number[] = []
for (const c of coursesData) {
  const result = insertCourse.run(c.title, c.description, c.language, c.level, c.cover_image, c.total_lessons)
  courseIds.push(Number(result.lastInsertRowid))
}

// Seed chapters and lessons
const insertChapter = db.prepare(`
  INSERT INTO chapters (course_id, title, order_num)
  VALUES (?, ?, ?)
`)

const insertLesson = db.prepare(`
  INSERT INTO lessons (chapter_id, title, type, order_num, content)
  VALUES (?, ?, ?, ?, ?)
`)

// Vocabulary content template
const vocabularyContent = (words: Array<{word: string, translation: string, pronunciation: string, example: string, exampleTranslation: string}>) =>
  JSON.stringify(words)

// Grammar content template
const grammarContent = (explanation: string, exercises: Array<{question: string, options: string[], correctIndex: number, explanation: string}>) =>
  JSON.stringify({ explanation, exercises })

// Speaking content template
const speakingContent = (sentences: Array<{text: string, translation: string}>) =>
  JSON.stringify({ sentences })

// Listening content template
const listeningContent = (passages: Array<{questions: Array<{question: string, options: string[], correctIndex: number}>}>) =>
  JSON.stringify({ passages })

// Course 1: 英语入门
let chapterId = Number(insertChapter.run(courseIds[0], '基础问候', 1).lastInsertRowid)
insertLesson.run(chapterId, '日常问候', 'vocabulary', 1, vocabularyContent([
  { word: 'Hello', translation: '你好', pronunciation: '/həˈloʊ/', example: 'Hello, how are you?', exampleTranslation: '你好，你好吗？' },
  { word: 'Goodbye', translation: '再见', pronunciation: '/ɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!', exampleTranslation: '再见，明天见！' },
  { word: 'Thank you', translation: '谢谢', pronunciation: '/θæŋk juː/', example: 'Thank you for your help.', exampleTranslation: '谢谢你的帮助。' },
  { word: 'Please', translation: '请', pronunciation: '/pliːz/', example: 'Please sit down.', exampleTranslation: '请坐下。' },
]))
insertLesson.run(chapterId, '基本语法：主谓结构', 'grammar', 2, grammarContent(
  '英语最基本的句子结构是主语+谓语。主语是动作的执行者，谓语是动作本身。',
  [
    { question: '选择正确的句子结构', options: ['She runs', 'Runs she', 'She run', 'Running she'], correctIndex: 0, explanation: '英语中主语在前，谓语在后，She是第三人称单数，谓语动词加s。' },
    { question: '"They ___ to school every day." 填入正确的词', options: ['go', 'goes', 'going', 'gone'], correctIndex: 0, explanation: 'They是复数主语，谓语动词用原形。' },
  ]
))
insertLesson.run(chapterId, '问候对话练习', 'speaking', 3, speakingContent([
  { text: 'Hi, my name is Tom. Nice to meet you!', translation: '嗨，我叫汤姆。很高兴认识你！' },
  { text: 'Good morning! How are you today?', translation: '早上好！你今天好吗？' },
]))
insertLesson.run(chapterId, '听懂问候语', 'listening', 4, listeningContent([
  { questions: [
    { question: '听到 "Good morning" 时，应该怎样回应？', options: ['Good morning!', 'Good evening!', 'Good night!', 'Goodbye!'], correctIndex: 0 },
    { question: '"How are you?" 是什么意思？', options: ['你是谁？', '你好吗？', '你多大了？', '你在哪里？'], correctIndex: 1 },
  ]}
]))

chapterId = Number(insertChapter.run(courseIds[0], '数字与时间', 2).lastInsertRowid)
insertLesson.run(chapterId, '数字1-20', 'vocabulary', 1, vocabularyContent([
  { word: 'One', translation: '一', pronunciation: '/wʌn/', example: 'I have one book.', exampleTranslation: '我有一本书。' },
  { word: 'Two', translation: '二', pronunciation: '/tuː/', example: 'There are two cats.', exampleTranslation: '有两只猫。' },
  { word: 'Three', translation: '三', pronunciation: '/θriː/', example: 'Three apples on the table.', exampleTranslation: '桌子上有三个苹果。' },
  { word: 'Ten', translation: '十', pronunciation: '/ten/', example: 'I count to ten.', exampleTranslation: '我数到十。' },
]))
insertLesson.run(chapterId, '时间表达', 'grammar', 2, grammarContent(
  '英语中表达时间使用 "It is + 时间" 的结构。整点用 o\'clock，半点用 half past。',
  [
    { question: '"3:00" 用英语怎么说？', options: ['It\'s three o\'clock', 'It\'s three half', 'It\'s three past', 'It\'s three minutes'], correctIndex: 0, explanation: '整点用 o\'clock 表示。' },
    { question: '"It\'s half past six" 是几点？', options: ['6:00', '6:30', '6:15', '6:45'], correctIndex: 1, explanation: 'half past 表示"半"，即30分钟。' },
  ]
))
insertLesson.run(chapterId, '数字听力练习', 'listening', 3, listeningContent([
  { questions: [
    { question: '听到 "five" 时，对应的数字是？', options: ['3', '4', '5', '6'], correctIndex: 2 },
    { question: '听到 "twelve" 时，对应的数字是？', options: ['10', '11', '12', '20'], correctIndex: 2 },
  ]}
]))
insertLesson.run(chapterId, '数字口语练习', 'speaking', 4, speakingContent([
  { text: 'My phone number is five-five-five-one-two-three-four.', translation: '我的电话号码是555-1234。' },
  { text: 'I wake up at seven o\'clock every morning.', translation: '我每天早上七点起床。' },
]))

// Course 2: 英语进阶
chapterId = Number(insertChapter.run(courseIds[1], '商务英语', 1).lastInsertRowid)
insertLesson.run(chapterId, '商务词汇', 'vocabulary', 1, vocabularyContent([
  { word: 'Meeting', translation: '会议', pronunciation: '/ˈmiːtɪŋ/', example: 'We have a meeting at 10 AM.', exampleTranslation: '我们上午10点有个会议。' },
  { word: 'Deadline', translation: '截止日期', pronunciation: '/ˈdedlaɪn/', example: 'The deadline is next Friday.', exampleTranslation: '截止日期是下周五。' },
  { word: 'Proposal', translation: '提案', pronunciation: '/prəˈpoʊzl/', example: 'I submitted the proposal yesterday.', exampleTranslation: '我昨天提交了提案。' },
]))
insertLesson.run(chapterId, '虚拟语气', 'grammar', 2, grammarContent(
  '虚拟语气用于表达假设、愿望或与事实相反的情况。If从句中使用过去时，主句中使用would + 动词原形。',
  [
    { question: '"If I ___ rich, I would travel the world." 填入正确的词', options: ['am', 'was', 'were', 'be'], correctIndex: 2, explanation: '虚拟语气中，be动词统一用were。' },
    { question: '哪个句子使用了虚拟语气？', options: ['I go to school every day.', 'If I were you, I would study harder.', 'She is reading a book.', 'They will come tomorrow.'], correctIndex: 1, explanation: 'If I were you 是典型的虚拟语气表达。' },
  ]
))
insertLesson.run(chapterId, '商务对话', 'speaking', 3, speakingContent([
  { text: 'Could we schedule a meeting to discuss the project?', translation: '我们可以安排一个会议来讨论这个项目吗？' },
  { text: 'I\'d like to propose a new marketing strategy.', translation: '我想提议一个新的营销策略。' },
]))

chapterId = Number(insertChapter.run(courseIds[1], '学术写作', 2).lastInsertRowid)
insertLesson.run(chapterId, '学术词汇', 'vocabulary', 1, vocabularyContent([
  { word: 'Hypothesis', translation: '假设', pronunciation: '/haɪˈpɑːθəsɪs/', example: 'The hypothesis was proven correct.', exampleTranslation: '这个假设被证明是正确的。' },
  { word: 'Analysis', translation: '分析', pronunciation: '/əˈnæləsɪs/', example: 'The analysis shows interesting results.', exampleTranslation: '分析显示了有趣的结果。' },
]))
insertLesson.run(chapterId, '论文结构', 'grammar', 2, grammarContent(
  '学术论文通常包含：Introduction（引言）、Body（正文）、Conclusion（结论）。每段应有明确的主题句。',
  [
    { question: '学术论文的三个主要部分是？', options: ['Start, Middle, End', 'Introduction, Body, Conclusion', 'Title, Content, Reference', 'Question, Answer, Summary'], correctIndex: 1, explanation: '学术论文的标准结构是 Introduction, Body, Conclusion。' },
  ]
))
insertLesson.run(chapterId, '学术讲座听力', 'listening', 3, listeningContent([
  { questions: [
    { question: '讲座中提到的 "methodology" 是什么意思？', options: ['方法论', '结论', '假设', '数据'], correctIndex: 0 },
  ]}
]))

chapterId = Number(insertChapter.run(courseIds[1], '高级口语', 3).lastInsertRowid)
insertLesson.run(chapterId, '演讲技巧', 'speaking', 1, speakingContent([
  { text: 'Ladies and gentlemen, thank you for being here today.', translation: '女士们先生们，感谢你们今天来到这里。' },
  { text: 'Let me illustrate this point with an example.', translation: '让我用一个例子来说明这一点。' },
]))
insertLesson.run(chapterId, '演讲听力理解', 'listening', 2, listeningContent([
  { questions: [
    { question: '演讲者说 "In conclusion" 时，接下来会是什么？', options: ['新的论点', '总结', '笑话', '提问'], correctIndex: 1 },
  ]}
]))

// Course 3: 日语基础
chapterId = Number(insertChapter.run(courseIds[2], '五十音图', 1).lastInsertRowid)
insertLesson.run(chapterId, 'あ行～さ行', 'vocabulary', 1, vocabularyContent([
  { word: 'あ (a)', translation: '阿', pronunciation: 'a', example: 'あさ (asa) - 早上', exampleTranslation: '早上' },
  { word: 'い (i)', translation: '伊', pronunciation: 'i', example: 'いぬ (inu) - 狗', exampleTranslation: '狗' },
  { word: 'う (u)', translation: '宇', pronunciation: 'u', example: 'うみ (umi) - 海', exampleTranslation: '海' },
  { word: 'か (ka)', translation: '加', pronunciation: 'ka', example: 'かぜ (kaze) - 风', exampleTranslation: '风' },
]))
insertLesson.run(chapterId, 'は行～わ行', 'vocabulary', 2, vocabularyContent([
  { word: 'は (ha)', translation: '哈', pronunciation: 'ha', example: 'はな (hana) - 花', exampleTranslation: '花' },
  { word: 'ま (ma)', translation: '马', pronunciation: 'ma', example: 'まち (machi) - 町', exampleTranslation: '城镇' },
  { word: 'や (ya)', translation: '呀', pronunciation: 'ya', example: 'やま (yama) - 山', exampleTranslation: '山' },
  { word: 'ら (ra)', translation: '拉', pronunciation: 'ra', example: 'らいおん (raion) - 狮子', exampleTranslation: '狮子' },
]))
insertLesson.run(chapterId, '基础语法：です/ます', 'grammar', 3, grammarContent(
  '日语中最基本的礼貌表达是「です」和「ます」。「です」用于名词句尾，「ます」用于动词句尾，表示礼貌。',
  [
    { question: '「私は学生___」填入正确的词', options: ['です', 'ます', 'だ', 'である'], correctIndex: 0, explanation: '名词句尾用「です」表示礼貌。' },
    { question: '「毎日日本語を勉強___」填入正确的词', options: ['です', 'ます', 'だ', 'である'], correctIndex: 1, explanation: '动词句尾用「ます」表示礼貌。' },
  ]
))
insertLesson.run(chapterId, '自我介绍', 'speaking', 4, speakingContent([
  { text: 'はじめまして、私は田中です。', translation: '初次见面，我是田中。' },
  { text: 'よろしくお願いします。', translation: '请多关照。' },
]))

chapterId = Number(insertChapter.run(courseIds[2], '日常会话', 2).lastInsertRowid)
insertLesson.run(chapterId, '日常词汇', 'vocabulary', 1, vocabularyContent([
  { word: 'おはよう', translation: '早上好', pronunciation: 'ohayou', example: 'おはようございます。', exampleTranslation: '早上好（礼貌）。' },
  { word: 'こんにちは', translation: '你好', pronunciation: 'konnichiwa', example: 'こんにちは、元気ですか？', exampleTranslation: '你好，你好吗？' },
  { word: 'ありがとう', translation: '谢谢', pronunciation: 'arigatou', example: 'ありがとうございます。', exampleTranslation: '非常感谢。' },
]))
insertLesson.run(chapterId, '听力：日常问候', 'listening', 2, listeningContent([
  { questions: [
    { question: '听到「おはようございます」时，应该怎样回应？', options: ['おはようございます', 'こんばんは', 'さようなら', 'すみません'], correctIndex: 0 },
    { question: '「ありがとうございます」是什么意思？', options: ['对不起', '谢谢', '你好', '再见'], correctIndex: 1 },
  ]}
]))
insertLesson.run(chapterId, '日常对话练习', 'speaking', 3, speakingContent([
  { text: 'すみません、駅はどこですか？', translation: '请问，车站在哪里？' },
  { text: '右に曲がってください。', translation: '请向右转。' },
]))
insertLesson.run(chapterId, '助词用法', 'grammar', 4, grammarContent(
  '日语助词「は」表示主题，「が」表示主语，「を」表示宾语，「に」表示方向或时间。',
  [
    { question: '「私は東京___行きます」填入正确的助词', options: ['を', 'に', 'が', 'は'], correctIndex: 1, explanation: '表示移动方向用助词「に」。' },
    { question: '「毎日日本語___勉強します」填入正确的助词', options: ['は', 'が', 'を', 'に'], correctIndex: 2, explanation: '表示动作对象用助词「を」。' },
  ]
))

// Course 4: 日语进阶
chapterId = Number(insertChapter.run(courseIds[3], '敬语表达', 1).lastInsertRowid)
insertLesson.run(chapterId, '敬语词汇', 'vocabulary', 1, vocabularyContent([
  { word: 'いらっしゃいませ', translation: '欢迎光临', pronunciation: 'irasshaimase', example: 'いらっしゃいませ、何かお探しですか？', exampleTranslation: '欢迎光临，您在找什么？' },
  { word: '申し訳ありません', translation: '非常抱歉', pronunciation: 'moushiwake arimasen', example: '申し訳ありません、予約が取れておりません。', exampleTranslation: '非常抱歉，没有预约上了。' },
]))
insertLesson.run(chapterId, '尊敬语与谦让语', 'grammar', 2, grammarContent(
  '日语敬语分为尊敬语（抬高对方）、谦让语（贬低自己）和丁宁语（礼貌表达）。',
  [
    { question: '「行く」的尊敬语是？', options: ['いらっしゃる', '参る', '行きます', '行かれる'], correctIndex: 0, explanation: 'いらっしゃる 是 行く 的尊敬语形式。' },
    { question: '「言う」的谦让语是？', options: ['おっしゃる', '申し上げる', '言います', '言われる'], correctIndex: 1, explanation: '申し上げる 是 言う 的谦让语形式。' },
  ]
))
insertLesson.run(chapterId, '商务日语对话', 'speaking', 3, speakingContent([
  { text: 'お忙しいところ、お時間をいただきありがとうございます。', translation: '感谢您在百忙之中抽出时间。' },
  { text: '恐れ入りますが、もう一度お説明いただけますか。', translation: '不好意思，能请您再说明一次吗？' },
]))
insertLesson.run(chapterId, '敬语听力', 'listening', 4, listeningContent([
  { questions: [
    { question: '「ご確認いただけますか」是什么意思？', options: ['能请您确认吗？', '我已经确认了', '请确认一下', '确认完毕'], correctIndex: 0 },
  ]}
]))

chapterId = Number(insertChapter.run(courseIds[3], '复杂语法', 2).lastInsertRowid)
insertLesson.run(chapterId, '条件表达', 'grammar', 1, grammarContent(
  '日语中条件表达有「と」「ば」「たら」「なら」四种形式，各有不同用法。',
  [
    { question: '表示自然结果的条件用哪个？', options: ['と', 'ば', 'たら', 'なら'], correctIndex: 0, explanation: '「と」用于表示必然的结果。' },
    { question: '「雨が降った___、傘を持って行きます」填入正确的词', options: ['と', 'ば', 'たら', 'なら'], correctIndex: 2, explanation: '「たら」用于表示偶然的条件。' },
  ]
))
insertLesson.run(chapterId, '高级词汇', 'vocabulary', 2, vocabularyContent([
  { word: '挑戦', translation: '挑战', pronunciation: 'ちょうせん', example: '新しいことに挑戦する。', exampleTranslation: '挑战新事物。' },
  { word: '努力', translation: '努力', pronunciation: 'どりょく', example: '努力が報われる。', exampleTranslation: '努力得到回报。' },
]))
insertLesson.run(chapterId, '新闻听力', 'listening', 3, listeningContent([
  { questions: [
    { question: '新闻中「経済成長」是什么意思？', options: ['经济增长', '经济衰退', '经济危机', '经济改革'], correctIndex: 0 },
  ]}
]))
insertLesson.run(chapterId, '意见表达', 'speaking', 4, speakingContent([
  { text: '私の意見としては、この計画に賛成です。', translation: '我的意见是赞成这个计划。' },
  { text: 'もう少し詳しく説明していただけますか。', translation: '能请您再详细说明一下吗？' },
]))

// Course 5: 韩语入门
chapterId = Number(insertChapter.run(courseIds[4], '韩语字母', 1).lastInsertRowid)
insertLesson.run(chapterId, '辅音与元音', 'vocabulary', 1, vocabularyContent([
  { word: 'ㄱ (g/k)', translation: '基', pronunciation: 'giyeok', example: '가 (ga) - 去', exampleTranslation: '去' },
  { word: 'ㄴ (n)', translation: '尼', pronunciation: 'nieun', example: '나 (na) - 我', exampleTranslation: '我' },
  { word: 'ㅏ (a)', translation: '阿', pronunciation: 'a', example: '아 (a) - 啊', exampleTranslation: '啊' },
  { word: 'ㅗ (o)', translation: '奥', pronunciation: 'o', example: '오 (o) - 五', exampleTranslation: '五' },
]))
insertLesson.run(chapterId, '基本语法：입니다/습니다', 'grammar', 2, grammarContent(
  '韩语最基本的礼貌结尾是「입니다」和「습니다」。「입니다」用于名词句尾，「습니다」用于动词句尾。',
  [
    { question: '「저는 학생___」填入正确的词', options: ['입니다', '습니다', '이다', '해요'], correctIndex: 0, explanation: '名词句尾用「입니다」表示礼貌。' },
    { question: '「매일 한국어를 공부___」填入正确的词', options: ['입니다', '습니다', '이다', '해요'], correctIndex: 1, explanation: '动词句尾用「습니다」表示礼貌。' },
  ]
))
insertLesson.run(chapterId, '自我介绍', 'speaking', 3, speakingContent([
  { text: '안녕하세요, 저는 김민수입니다.', translation: '你好，我是金民秀。' },
  { text: '만나서 반갑습니다.', translation: '很高兴认识你。' },
]))
insertLesson.run(chapterId, '听懂问候语', 'listening', 4, listeningContent([
  { questions: [
    { question: '听到「안녕하세요」时，应该怎样回应？', options: ['안녕하세요!', '감사합니다!', '미안합니다!', '안녕히 가세요!'], correctIndex: 0 },
    { question: '「감사합니다」是什么意思？', options: ['对不起', '谢谢', '你好', '再见'], correctIndex: 1 },
  ]}
]))

chapterId = Number(insertChapter.run(courseIds[4], '日常用语', 2).lastInsertRowid)
insertLesson.run(chapterId, '日常词汇', 'vocabulary', 1, vocabularyContent([
  { word: '안녕하세요', translation: '你好', pronunciation: 'annyeonghaseyo', example: '안녕하세요, 잘 지내세요?', exampleTranslation: '你好，你好吗？' },
  { word: '감사합니다', translation: '谢谢', pronunciation: 'gamsahamnida', example: '도와주셔서 감사합니다.', exampleTranslation: '感谢您的帮助。' },
  { word: '미안합니다', translation: '对不起', pronunciation: 'mianhamnida', example: '늦어서 미안합니다.', exampleTranslation: '对不起我迟到了。' },
]))
insertLesson.run(chapterId, '助词用法', 'grammar', 2, grammarContent(
  '韩语助词「은/는」表示主题，「이/가」表示主语，「을/를」表示宾语，「에」表示方向或时间。',
  [
    { question: '「저는 서울___ 갑니다」填入正确的助词', options: ['을', '에', '이', '는'], correctIndex: 1, explanation: '表示移动方向用助词「에」。' },
    { question: '「매일 한국어___ 공부합니다」填入正确的助词', options: ['는', '가', '을', '에'], correctIndex: 2, explanation: '表示动作对象用助词「을/를」。' },
  ]
))
insertLesson.run(chapterId, '日常对话', 'speaking', 3, speakingContent([
  { text: '실례합니다, 화장실이 어디에 있습니까?', translation: '请问，洗手间在哪里？' },
  { text: '오른쪽으로 가세요.', translation: '请向右走。' },
]))
insertLesson.run(chapterId, '日常听力', 'listening', 4, listeningContent([
  { questions: [
    { question: '听到「얼마예요?」时，对方在问什么？', options: ['几点了？', '多少钱？', '在哪里？', '你是谁？'], correctIndex: 1 },
  ]}
]))

// Course 6: 韩语中级
chapterId = Number(insertChapter.run(courseIds[5], '生活韩语', 1).lastInsertRowid)
insertLesson.run(chapterId, '生活词汇', 'vocabulary', 1, vocabularyContent([
  { word: '주문', translation: '点餐', pronunciation: 'jumun', example: '주문하시겠습니까?', exampleTranslation: '请问要点什么？' },
  { word: '배달', translation: '外卖/配送', pronunciation: 'baedal', example: '배달로 시켰어요.', exampleTranslation: '我叫了外卖。' },
  { word: '예약', translation: '预约', pronunciation: 'yeyak', example: '예약을 하고 싶습니다.', exampleTranslation: '我想预约。' },
]))
insertLesson.run(chapterId, '过去时与未来时', 'grammar', 2, grammarContent(
  '韩语过去时在词干后加「았/었」，未来时加「겠」或「ㄹ/을 거예요」。',
  [
    { question: '「어제 영화를 ___」(看了电影) 填入正确的词', options: ['봤어요', '봐요', '볼 거예요', '봅니다'], correctIndex: 0, explanation: '보다的过去时是봤어요。' },
    { question: '「내일 친구를 ___」(明天要见朋友) 填入正确的词', options: ['만났어요', '만나요', '만날 거예요', '만납니다'], correctIndex: 2, explanation: '表示未来计划用「ㄹ/을 거예요」。' },
  ]
))
insertLesson.run(chapterId, '餐厅对话', 'speaking', 3, speakingContent([
  { text: '메뉴 좀 보여주세요.', translation: '请给我看一下菜单。' },
  { text: '이거 하나 주세요.', translation: '请给我一个这个。' },
]))
insertLesson.run(chapterId, '对话听力', 'listening', 4, listeningContent([
  { questions: [
    { question: '「계산서 주세요」是什么意思？', options: ['请给我菜单', '请买单', '请点餐', '请预约'], correctIndex: 1 },
  ]}
]))

chapterId = Number(insertChapter.run(courseIds[5], '旅行韩语', 2).lastInsertRowid)
insertLesson.run(chapterId, '旅行词汇', 'vocabulary', 1, vocabularyContent([
  { word: '공항', translation: '机场', pronunciation: 'gonghang', example: '공항까지 얼마나 걸려요?', exampleTranslation: '到机场要多久？' },
  { word: '호텔', translation: '酒店', pronunciation: 'hotel', example: '호텔을 예약했어요.', exampleTranslation: '我预订了酒店。' },
]))
insertLesson.run(chapterId, '请求与建议', 'grammar', 2, grammarContent(
  '韩语中请求用「-아/어 주세요」，建议用「-는 게 어때요?」。',
  [
    { question: '「문 좀 ___」(请开门) 填入正确的词', options: ['열어 주세요', '열어요', '여세요', '열겠어요'], correctIndex: 0, explanation: '请求别人做某事用「-아/어 주세요」。' },
    { question: '建议对方休息一下怎么说？', options: ['쉬세요', '쉬어 주세요', '쉬는 게 어때요?', '쉬겠어요'], correctIndex: 2, explanation: '建议用「-는 게 어때요?」。' },
  ]
))
insertLesson.run(chapterId, '旅行对话', 'speaking', 3, speakingContent([
  { text: '이 근처에 관광지가 있습니까?', translation: '这附近有旅游景点吗？' },
  { text: '사진 좀 찍어 주시겠어요?', translation: '能帮我拍张照吗？' },
]))
insertLesson.run(chapterId, '旅行听力', 'listening', 4, listeningContent([
  { questions: [
    { question: '「출발 시간이 언제예요?」是什么意思？', options: ['什么时候到达？', '什么时候出发？', '在哪里集合？', '多少钱？'], correctIndex: 1 },
  ]}
]))

// Seed achievements
const insertAchievement = db.prepare(`
  INSERT INTO achievements (name, description, icon, category)
  VALUES (?, ?, ?, ?)
`)

const achievementsData = [
  { name: '初出茅庐', description: '完成第一课', icon: '🌱', category: 'course' },
  { name: '坚持不懈', description: '连续学习7天', icon: '🔥', category: 'streak' },
  { name: '学海无涯', description: '完成10节课', icon: '📚', category: 'course' },
  { name: '单词达人', description: '完成5节词汇课', icon: '📖', category: 'skill' },
  { name: '语法高手', description: '完成5节语法课', icon: '✏️', category: 'skill' },
  { name: '口语新秀', description: '完成3节口语课', icon: '🎤', category: 'skill' },
  { name: '听力精英', description: '完成3节听力课', icon: '👂', category: 'skill' },
  { name: '社交达人', description: '发布第一条社区动态', icon: '🌟', category: 'social' },
]

for (const a of achievementsData) {
  insertAchievement.run(a.name, a.description, a.icon, a.category)
}

// Seed community posts
const insertPost = db.prepare(`
  INSERT INTO posts (user_id, content, likes, created_at)
  VALUES (?, ?, ?, ?)
`)

const postsData = [
  { user_id: 1, content: '今天完成了日语五十音图的学习，感觉进步很大！加油💪', likes: 12, created_at: '2024-01-15 10:30:00' },
  { user_id: 1, content: '分享一个学习英语的小技巧：每天坚持听15分钟英语播客，听力提升很快！', likes: 25, created_at: '2024-01-16 14:20:00' },
  { user_id: 1, content: '韩语的敬语体系真的好复杂，有没有人可以分享一下学习心得？', likes: 8, created_at: '2024-01-17 09:15:00' },
  { user_id: 1, content: '终于拿到了"坚持不懈"成就！连续7天打卡学习🎉', likes: 30, created_at: '2024-01-18 16:45:00' },
  { user_id: 1, content: '推荐大家试试"影子跟读法"练习口语，效果非常好！', likes: 18, created_at: '2024-01-19 11:00:00' },
]

for (const p of postsData) {
  insertPost.run(p.user_id, p.content, p.likes, p.created_at)
}

// Enroll demo user in some courses
const insertUserCourse = db.prepare(`
  INSERT INTO user_courses (user_id, course_id, completed_lessons, enrolled_at)
  VALUES (?, ?, ?, ?)
`)

insertUserCourse.run(1, courseIds[0], 5, '2024-01-10 08:00:00')
insertUserCourse.run(1, courseIds[2], 3, '2024-01-12 09:00:00')

// Add some progress for demo user
const insertProgress = db.prepare(`
  INSERT INTO user_progress (user_id, lesson_id, score, time_spent, completed, completed_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

// Mark some lessons as completed for demo user (lessons 1-5)
for (let i = 1; i <= 5; i++) {
  insertProgress.run(1, i, 80 + Math.floor(Math.random() * 20), 300 + Math.floor(Math.random() * 200), 1, '2024-01-15 10:00:00')
}

export default db
