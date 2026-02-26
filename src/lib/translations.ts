export type Lang = 'en' | 'ru';

// ── Word-reveal arrays ──────────────────────────────────────────────
export const subtitleWords: Record<Lang, string[]> = {
  en: [
    '93%', 'of', 'communication', 'is', 'paralinguistic.', 'Tone,', 'timing,',
    'pace,', 'emotion.', 'Current', 'messaging', 'captures', 'none', 'of', 'it.',
    'belo', 'is', 'a', 'messaging', 'app', 'built', 'around', 'ambient', 'AI.',
    'Lightweight', 'sentiment', 'models', 'process', 'everything', 'on-device,',
    'in', 'real', 'time.', 'The', 'interface', 'reflects', 'the', 'emotional',
    'state', 'of', 'the', 'conversation.', 'Colors', 'shift,', 'atmosphere',
    'adapts,', 'nudges', 'appear', 'when', 'tone', 'gets', 'heated.',
    'Nothing', 'leaves', 'the', 'phone.',
  ],
  ru: [
    '93%', 'коммуникации', 'паралингвистика.', 'Тон,', 'ритм,', 'темп,',
    'эмоция.', 'Современные', 'мессенджеры', 'не', 'передают', 'ничего',
    'из', 'этого.', 'belo', 'это', 'мессенджер,', 'построенный', 'на',
    'фоновом', 'ИИ.', 'Лёгкие', 'модели', 'анализа', 'тональности',
    'работают', 'на', 'устройстве,', 'в', 'реальном', 'времени.',
    'Интерфейс', 'отражает', 'эмоциональное', 'состояние', 'разговора.',
    'Цвета', 'меняются,', 'атмосфера', 'адаптируется,', 'подсказки',
    'появляются,', 'когда', 'тон', 'обостряется.',
    'Ничего', 'не', 'покидает', 'телефон.',
  ],
};

// ── Regional ad market (has inline <span> highlights) ───────────────
export const revenueAdMarketParts: Record<Lang, [string, string, string]> = {
  en: [
    "Uzbekistan\u2019s digital ad market projected at ",
    " by 2028. Kazakhstan\u2019s internet ad revenue growing ",
    " year-over-year. Establishing belo as a core platform captures a share of this growth.",
  ],
  ru: [
    "Прогноз рынка цифровой рекламы Узбекистана \u2014 ",
    " к 2028 году. Доход от интернет-рекламы в Казахстане растёт на ",
    " в год. Утверждение belo как ключевой платформы позволяет занять долю этого роста.",
  ],
};

// ── Flat translation map ────────────────────────────────────────────
const t: Record<string, Record<Lang, string>> = {
  // Hero
  'hero.byline':             { en: 'by GIOIA', ru: 'от GIOIA' },

  // Features
  'features.label':          { en: 'How it works', ru: 'Как это работает' },
  'features.heading':        { en: 'Three ambient AI features, all on-device', ru: 'Три функции фонового ИИ, полностью на устройстве' },
  'features.semantic.title':  { en: 'Semantic Mood Detection', ru: 'Семантическое распознавание настроения' },
  'features.semantic.desc':   { en: 'Real-time sentiment analysis changes the visual atmosphere of a chat. Colors, effects, and background shift based on the emotional state of both people in the conversation.', ru: 'Анализ тональности в реальном времени меняет визуальную атмосферу чата. Цвета, эффекты и фон подстраиваются под эмоциональное состояние обоих собеседников.' },
  'features.nudges.title':    { en: 'Emotional Nudges', ru: 'Эмоциональные подсказки' },
  'features.nudges.desc':     { en: 'Gentle, dismissable suggestions when the model detects the conversation shifting. Designed to help without being intrusive.', ru: 'Мягкие, ненавязчивые подсказки, когда модель замечает изменение тона разговора. Созданы, чтобы помогать, не мешая.' },
  'features.glance.title':    { en: 'Mood at a Glance', ru: 'Настроение с первого взгляда' },
  'features.glance.desc':     { en: 'A visual summary on the home screen showing the emotional tone of each conversation. Mood-colored auras around each contact, visible before you open the chat.', ru: 'Визуальная сводка на главном экране с эмоциональным тоном каждого разговора. Цветные ауры настроения вокруг контактов, видимые ещё до открытия чата.' },

  // Market
  'market.label':            { en: 'The market', ru: 'Рынок' },
  'market.sub':              { en: 'people across Central Asia. The youngest population in the post-Soviet world. No messaging platform built for how they actually communicate.', ru: 'человек в Центральной Азии. Самое молодое население на постсоветском пространстве. Ни одного мессенджера, созданного под их реальный стиль общения.' },
  'market.stat1.value':      { en: '50%+', ru: '50%+' },
  'market.stat1.text':       { en: ' of the population is under 30.', ru: ' населения моложе 30 лет.' },
  'market.stat2.value':      { en: '~27', ru: '~27' },
  'market.stat2.text':       { en: ' median age \u2014 compared to 44 across Europe.', ru: ' медианный возраст \u2014 по сравнению с 44 в Европе.' },
  'market.stat3.value':      { en: '96%', ru: '96%' },
  'market.stat3.text':       { en: ' internet penetration in Kazakhstan alone.', ru: ' проникновение интернета только в Казахстане.' },
  'market.context':          { en: 'The infrastructure exists. The audience is online. What\u2019s missing is a product designed for them. One that understands regional communication patterns, social hierarchies, and multilingual nuance that global platforms will never optimize for.', ru: 'Инфраструктура есть. Аудитория онлайн. Не хватает продукта, созданного для них. Того, который понимает региональные паттерны общения, социальные иерархии и многоязычные нюансы, под которые глобальные платформы никогда не будут оптимизироваться.' },

  // Revenue
  'revenue.label':           { en: 'Business model', ru: 'Бизнес-модель' },
  'revenue.heading':         { en: 'The product is free. The business is in what it enables.', ru: 'Продукт бесплатный. Бизнес \u2014 в том, что он открывает.' },
  'revenue.ads.title':       { en: 'Emotion-Aware Advertising', ru: 'Эмоционально-ориентированная реклама' },
  'revenue.ads.desc':        { en: 'belo doesn\u2019t just know what people talk about. It understands how they feel when they say it. Ad targeting based on mood and intent, not just demographics. Brands reach users when they\u2019re genuinely receptive.', ru: 'belo не просто знает, о чём говорят люди. Он понимает, что они чувствуют, когда это говорят. Таргетинг рекламы на основе настроения и намерений, а не только демографии. Бренды достигают пользователей, когда те по-настоящему восприимчивы.' },
  'revenue.intel.title':     { en: 'Marketing Intelligence', ru: 'Маркетинговая аналитика' },
  'revenue.intel.desc':      { en: 'Anonymized, aggregated communication patterns as a market research tool. Real-time emotional sentiment across cities, demographics, product categories. This data doesn\u2019t exist elsewhere.', ru: 'Анонимизированные агрегированные паттерны коммуникации как инструмент маркетинговых исследований. Эмоциональная тональность в реальном времени по городам, демографии, категориям продуктов. Таких данных нет больше нигде.' },
  'revenue.data.title':      { en: 'AI Data Licensing', ru: 'Лицензирование данных для ИИ' },
  'revenue.data.desc':       { en: 'Paralinguistic patterns. Typing rhythms, emotional markers, communication cadence. Licensed to AI companies for training more human-like systems. Vector embeddings, not raw messages. With user consent.', ru: 'Паралингвистические паттерны. Ритмы набора текста, эмоциональные маркеры, каденция общения. Лицензируются ИИ-компаниям для обучения более человечных систем. Векторные эмбеддинги, не сырые сообщения. С согласия пользователей.' },
  'revenue.premium.title':   { en: 'Premium & Digital Twins', ru: 'Премиум и цифровые двойники' },
  'revenue.premium.desc':    { en: 'Free users get the core experience. Premium tiers unlock Digital Twins. AI models of your communication style that draft messages in your voice, suggest responses, represent you in async conversations.', ru: 'Бесплатные пользователи получают основной опыт. Премиум открывает цифровых двойников. ИИ-модели вашего стиля общения, которые составляют сообщения вашим голосом, предлагают ответы, представляют вас в асинхронных разговорах.' },
  'revenue.enterprise.title': { en: 'Enterprise', ru: 'Корпоративные решения' },
  'revenue.enterprise.desc':  { en: 'Communication analytics for teams. Sentiment tracking, burnout pattern detection, customer support tools that detect frustration in real time. The same ambient AI, applied to B2B.', ru: 'Коммуникационная аналитика для команд. Отслеживание тональности, выявление паттернов выгорания, инструменты поддержки клиентов, определяющие раздражение в реальном времени. Тот же фоновый ИИ, применённый к B2B.' },
  'revenue.admarket.title':   { en: 'Regional Ad Market', ru: 'Региональный рекламный рынок' },

  // Technology
  'tech.label':              { en: 'Technology', ru: 'Технология' },
  'tech.heading':            { en: 'Built on-device, designed to scale', ru: 'Работает на устройстве, создан для масштаба' },
  'tech.body':               { en: 'Sentiment analysis runs locally using micro transformer models. Mood scores, not messages, are exchanged between users via WebSocket. AI inference costs stay near zero. Message content never touches a server.', ru: 'Анализ тональности выполняется локально с помощью микро-трансформерных моделей. Между пользователями через WebSocket передаются оценки настроения, а не сообщения. Затраты на ИИ-инференс стремятся к нулю. Содержимое сообщений никогда не попадает на сервер.' },
  'tech.ondevice.title':     { en: 'On-Device AI', ru: 'ИИ на устройстве' },
  'tech.ondevice.desc':      { en: 'Lightweight models process tone and context directly on the phone. Privacy is structural, not a policy.', ru: 'Лёгкие модели обрабатывают тон и контекст прямо на телефоне. Приватность \u2014 архитектурное решение, а не политика.' },
  'tech.twins.title':        { en: 'Digital Twins', ru: 'Цифровые двойники' },
  'tech.twins.desc':         { en: 'Over time, each user builds a vector-based profile of their communication style. Continuously updated embeddings, not fine-tuned models.', ru: 'Со временем каждый пользователь формирует векторный профиль своего стиля общения. Постоянно обновляемые эмбеддинги, а не дообученные модели.' },
  'tech.embeddings.title':   { en: 'Data as Embeddings', ru: 'Данные как эмбеддинги' },
  'tech.embeddings.desc':    { en: 'Behavioral and emotional patterns stored as vector embeddings, never raw messages. Applications in health, marketing, education, and AI training. The product comes first.', ru: 'Поведенческие и эмоциональные паттерны хранятся как векторные эмбеддинги, никогда \u2014 как сырые сообщения. Применения в здравоохранении, маркетинге, образовании и обучении ИИ. Продукт \u2014 на первом месте.' },

  // Data sovereignty
  'sovereignty.label':       { en: 'Data sovereignty', ru: 'Суверенитет данных' },
  'sovereignty.heading':     { en: 'Data generated in the region stays in the region', ru: 'Данные, созданные в регионе, остаются в регионе' },
  'sovereignty.text1':       { en: 'Most global platforms extract user data from emerging markets and process it in foreign jurisdictions. GIOIA is building differently. Data sovereignty is a core architectural decision, not a compliance afterthought.', ru: 'Большинство глобальных платформ извлекают данные пользователей из развивающихся рынков и обрабатывают их в иностранных юрисдикциях. GIOIA строит иначе. Суверенитет данных \u2014 ключевое архитектурное решение, а не формальность для соответствия требованиям.' },
  'sovereignty.text2':       { en: 'Central Asian governments are investing in digital independence. Operating locally, with flexible data sovereignty frameworks, is a real structural advantage. The biggest barrier to cross-platform data use isn\u2019t technical. It\u2019s legal.', ru: 'Правительства Центральной Азии инвестируют в цифровую независимость. Локальная работа с гибкими рамками суверенитета данных \u2014 реальное структурное преимущество. Главный барьер для кросс-платформенного использования данных \u2014 не технический. Он юридический.' },

  // Close / CTA
  'close.text':             { en: 'Imagine more.', ru: 'Представьте больше.' },
  'close.cta':              { en: 'Get in Touch', ru: 'Связаться с нами' },

  // Contact form
  'form.name':              { en: 'Name', ru: 'Имя' },
  'form.email':             { en: 'Email', ru: 'Эл. почта' },
  'form.company':           { en: 'Company (optional)', ru: 'Компания (необязательно)' },
  'form.message':           { en: 'Message', ru: 'Сообщение' },
  'form.send':              { en: 'Send', ru: 'Отправить' },
  'form.sending':           { en: 'Sending...', ru: 'Отправка...' },
  'form.back':              { en: 'Back', ru: 'Назад' },
  'form.success':           { en: 'Sent successfully.', ru: 'Отправлено успешно.' },
  'form.error':             { en: 'Something went wrong. Please try again.', ru: 'Что-то пошло не так. Попробуйте ещё раз.' },

  // Footer
  'footer.copy':            { en: '\u00A9 2026 GIOIA. All rights reserved.', ru: '\u00A9 2026 GIOIA. Все права защищены.' },
};

// ── Accessor ────────────────────────────────────────────────────────
export function tr(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? t[key]?.en ?? key;
}
