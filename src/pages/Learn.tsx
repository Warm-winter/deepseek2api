import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Volume2, Mic, CheckCircle2, XCircle } from 'lucide-react';
import { useLearningStore } from '@/store/useLearningStore';
import type { VocabItem, GrammarQuestion, SpeakingContent } from '@/lib/api';

// Vocabulary Module
function VocabModule({ items }: { items: VocabItem[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const item = items[index];

  const next = useCallback(() => {
    if (index < items.length - 1) {
      setFlipped(false);
      setIndex(index + 1);
    }
  }, [index, items.length]);

  const prev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setIndex(index - 1);
    }
  }, [index]);

  return (
    <div className="flex flex-col items-center">
      {/* Flip card */}
      <div className="perspective w-full max-w-md" style={{ height: 280 }}>
        <div
          className={`flip-card-inner ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped(!flipped)}
        >
          <div className="flip-card-front flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-lg cursor-pointer">
            <p className="text-4xl font-display font-bold text-navy">{item.word}</p>
            <p className="mt-2 text-sm text-navy/40">点击翻转查看释义</p>
          </div>
          <div className="flip-card-back flex flex-col items-center justify-center rounded-2xl gradient-orange p-8 shadow-lg cursor-pointer text-white">
            <p className="text-3xl font-bold">{item.translation}</p>
            <p className="mt-2 text-sm text-white/70">{item.pronunciation}</p>
            <div className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm">
              <p>{item.example}</p>
              <p className="mt-1 text-white/70">{item.exampleTranslation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2">
        {items.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? 'bg-orange w-6' : i < index ? 'bg-mint' : 'bg-navy/10'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-lg border border-navy/10 px-4 py-2 text-sm font-medium text-navy/60 transition hover:bg-warm-gray disabled:opacity-30"
        >
          <ChevronLeft size={16} /> 上一个
        </button>
        <button
          onClick={next}
          disabled={index === items.length - 1}
          className="flex items-center gap-1 rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-dark disabled:opacity-30"
        >
          下一个 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Grammar Module
function GrammarModule({ questions }: { questions: GrammarQuestion[] }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(false);
  const q = questions[qIndex];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    const isCorrect = idx === q.correctIndex;
    setCorrect(isCorrect);
    setShowResult(true);
  };

  const nextQ = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setShowResult(false);
      setCorrect(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-4 flex items-center justify-between text-sm text-navy/40">
        <span>第 {qIndex + 1} 题 / 共 {questions.length} 题</span>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-lg font-bold text-navy">{q.question}</p>
        <div className="mt-4 space-y-3">
          {q.options.map((opt, i) => {
            let cls = 'border-navy/10 hover:border-orange hover:bg-orange/5';
            if (showResult) {
              if (i === q.correctIndex) cls = 'border-mint bg-mint/10';
              else if (i === selected && !correct) cls = 'border-coral bg-coral/10';
            } else if (i === selected) {
              cls = 'border-orange bg-orange/10';
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition ${cls} ${
                  showResult && i === q.correctIndex ? 'animate-pulse-green' : ''
                } ${showResult && i === selected && !correct ? 'animate-shake' : ''}`}
              >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/5 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {showResult && i === q.correctIndex && <CheckCircle2 size={16} className="ml-2 inline text-mint" />}
                {showResult && i === selected && !correct && <XCircle size={16} className="ml-2 inline text-coral" />}
              </button>
            );
          })}
        </div>
        {showResult && (
          <div className={`mt-4 rounded-lg p-4 text-sm ${correct ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral'}`}>
            <p className="font-medium">{correct ? '回答正确！' : '回答错误'}</p>
            <p className="mt-1 text-navy/60">{q.explanation}</p>
          </div>
        )}
      </div>
      {showResult && (
        <button
          onClick={nextQ}
          disabled={qIndex >= questions.length - 1}
          className="mt-4 w-full rounded-lg bg-orange py-3 font-medium text-white transition hover:bg-orange-dark disabled:opacity-30"
        >
          下一题
        </button>
      )}
    </div>
  );
}

// Speaking Module
function SpeakingModule({ items }: { items: SpeakingContent[] }) {
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const item = items[index];

  const toggleRecord = () => {
    setRecording(!recording);
    if (!recording) {
      setTimeout(() => setRecording(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <p className="text-center text-2xl font-bold text-navy">{item.sentence}</p>
        <p className="mt-2 text-center text-sm text-navy/40">{item.translation}</p>
        <p className="mt-1 text-center text-xs text-navy/30">{item.pronunciation}</p>
      </div>

      {/* Play audio button */}
      <button className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-orange/10 text-orange transition hover:bg-orange/20">
        <Volume2 size={24} />
      </button>

      {/* Record button */}
      <button
        onClick={toggleRecord}
        className={`mt-6 flex h-16 w-16 items-center justify-center rounded-full transition ${
          recording ? 'bg-coral text-white animate-pulse' : 'bg-orange/10 text-orange hover:bg-orange/20'
        }`}
      >
        <Mic size={28} />
      </button>
      <p className="mt-2 text-xs text-navy/40">{recording ? '正在录音...' : '点击开始录音'}</p>

      {/* Waveform visualization */}
      {recording && (
        <div className="mt-4 flex items-end gap-1 h-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="waveform-bar w-1.5 rounded-full bg-orange"
              style={{ height: 4 }}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => index > 0 && setIndex(index - 1)}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-lg border border-navy/10 px-4 py-2 text-sm font-medium text-navy/60 transition hover:bg-warm-gray disabled:opacity-30"
        >
          <ChevronLeft size={16} /> 上一句
        </button>
        <button
          onClick={() => index < items.length - 1 && setIndex(index + 1)}
          disabled={index === items.length - 1}
          className="flex items-center gap-1 rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-dark disabled:opacity-30"
        >
          下一句 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Listening Module
function ListeningModule({ content }: { content: { transcript: string; translation: string; questions: GrammarQuestion[] } }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Audio player */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange text-white transition hover:bg-orange-dark"
          >
            <Volume2 size={24} />
          </button>
          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-warm-gray">
              <div className="h-full w-1/3 rounded-full bg-orange transition-all" />
            </div>
            <div className="mt-1 flex justify-between text-xs text-navy/30">
              <span>0:05</span>
              <span>0:15</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-navy/40">语速：</span>
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                speed === s ? 'bg-orange text-white' : 'bg-warm-gray text-navy/50'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="text-sm font-medium text-orange hover:text-orange-dark transition"
      >
        {showTranscript ? '隐藏原文' : '显示原文'}
      </button>
      {showTranscript && (
        <div className="rounded-lg bg-white p-4 shadow-sm animate-slide-down">
          <p className="text-sm text-navy/70">{content.transcript}</p>
          <p className="mt-2 text-xs text-navy/40">{content.translation}</p>
        </div>
      )}

      {/* Comprehension questions */}
      {content.questions.length > 0 && (
        <GrammarModule questions={content.questions} />
      )}
    </div>
  );
}

// Main Learn page
export default function Learn() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { currentLesson, fetchLessonContent, loading } = useLearningStore();

  useEffect(() => {
    if (lessonId) fetchLessonContent(lessonId);
  }, [lessonId, fetchLessonContent]);

  if (loading || !currentLesson) {
    return <div className="py-20 text-center text-navy/40">加载中...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-navy">{currentLesson.title}</h1>
          <p className="text-sm text-navy/40">
            {currentLesson.type === 'vocabulary' && '词汇学习'}
            {currentLesson.type === 'grammar' && '语法练习'}
            {currentLesson.type === 'speaking' && '口语练习'}
            {currentLesson.type === 'listening' && '听力练习'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-gray text-navy/40 transition hover:bg-warm-gray/80 hover:text-navy"
        >
          <X size={20} />
        </button>
      </div>

      {/* Module content */}
      {currentLesson.type === 'vocabulary' && currentLesson.vocabulary && (
        <VocabModule items={currentLesson.vocabulary} />
      )}
      {currentLesson.type === 'grammar' && currentLesson.grammar && (
        <GrammarModule questions={currentLesson.grammar} />
      )}
      {currentLesson.type === 'speaking' && currentLesson.speaking && (
        <SpeakingModule items={currentLesson.speaking} />
      )}
      {currentLesson.type === 'listening' && currentLesson.listening && (
        <ListeningModule content={currentLesson.listening} />
      )}
    </div>
  );
}
