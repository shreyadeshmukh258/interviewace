import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Send, Mic, Volume2, VolumeX, Square, Bot, Radio } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { Skeleton, Spinner } from '../components/ui';

const PER_QUESTION = 180;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const started = useRef(Date.now());
  const draftKey = `ia_draft_${id}`;
  const recognitionRef = useRef(null);

  // Stop interviewer voice
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Text-To-Speech: Interviewer asks question aloud
  const speakQuestion = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('David') ||
            v.name.includes('Zira') ||
            v.lang === 'en-US') &&
          v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Speech-To-Text: Candidate voice answer via microphone
  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    // Stop interviewer speech so microphone doesn't pick it up
    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Microphone active. Speak your answer!');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final) {
          setAnswers((prev) =>
            prev.map((val, i) => {
              if (i !== index) return val;
              const existing = val.trim();
              const addition = final.trim();
              return existing ? `${existing} ${addition}` : addition;
            })
          );
        }
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else if (event.error !== 'no-speech') {
          toast.error(`Microphone notice: ${event.error}`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      toast.error('Could not activate microphone. Please try again.');
      setIsListening(false);
    }
  }, [isListening, index, stopSpeaking]);

  useEffect(() => {
    api
      .get(`/interview/${id}`)
      .then(({ interview }) => {
        if (interview.status === 'completed') return navigate(`/interview/${id}/feedback`, { replace: true });
        const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
        setInterview(interview);
        setAnswers(draft?.answers?.length === interview.questions.length ? draft.answers : interview.questions.map(() => ''));
        setLeft(draft?.left ?? interview.questions.length * PER_QUESTION);
      })
      .catch((e) => {
        toast.error(e.message);
        navigate('/dashboard');
      });
  }, [id, navigate, draftKey]);

  useEffect(() => {
    if (interview) localStorage.setItem(draftKey, JSON.stringify({ answers, left }));
  }, [answers, left, interview, draftKey]);

  const submit = useCallback(async () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setSubmitting(true);
    try {
      await api.post('/interview/submit', {
        interviewId: id,
        answers,
        durationSeconds: Math.round((Date.now() - started.current) / 1000),
      });
      localStorage.removeItem(draftKey);
      navigate(`/interview/${id}/feedback`, { replace: true });
    } catch (e) {
      toast.error(e.message);
      setSubmitting(false);
    }
  }, [id, answers, navigate, draftKey, stopSpeaking]);

  useEffect(() => {
    if (!interview || submitting) return;
    if (left <= 0) {
      toast('Time is up. Submitting your answers.');
      submit();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, interview, submitting, submit]);

  // Voice playback and mic reset whenever question changes
  useEffect(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
    stopSpeaking();

    if (interview?.questions?.[index]) {
      if (autoSpeak) {
        const timer = setTimeout(() => {
          speakQuestion(interview.questions[index].text);
        }, 300);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [index, interview, autoSpeak, speakQuestion, stopSpeaking]);

  const answered = useMemo(() => answers.filter((a) => a.trim()).length, [answers]);

  if (!interview) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-40" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <Spinner className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-4 text-xl font-bold">Evaluating your answers</h2>
          <p className="mt-1 text-sm text-ink-soft">This usually takes 10 to 20 seconds.</p>
        </div>
      </div>
    );
  }

  const q = interview.questions[index];
  const last = index === interview.questions.length - 1;
  const total = interview.questions.length;

  const finish = () => {
    if (answered < total && !confirm(`You answered ${answered} of ${total} questions. Submit anyway?`)) return;
    submit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold">{interview.role}</h1>
          <p className="text-sm text-ink-soft">
            {interview.type} · {interview.difficulty}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold tabular-nums ${
            left < 120 ? 'bg-red-50 text-danger' : 'bg-white text-ink shadow-glass'
          }`}
          role="timer"
        >
          <Clock className="h-4 w-4" /> {fmt(left)}
        </div>
      </div>

      <div className="mb-2 flex justify-between text-xs font-semibold text-ink-soft">
        <span>
          Question {index + 1} of {total}
        </span>
        <span>{answered} answered</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="glass p-6 sm:p-8"
        >
          {/* Live Interviewer Status & Voice Controls */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                  isSpeaking ? 'bg-primary text-white shadow-lg ring-4 ring-primary/20' : 'bg-slate-100 text-ink-soft'
                }`}
              >
                <Bot className="h-5 w-5" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">AI Interviewer</span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-bold text-primary">
                      <span className="flex items-end gap-0.5">
                        <span className="h-2 w-0.5 animate-bounce rounded-full bg-primary"></span>
                        <span className="h-3 w-0.5 animate-bounce rounded-full bg-primary delay-100"></span>
                        <span className="h-1.5 w-0.5 animate-bounce rounded-full bg-primary delay-200"></span>
                      </span>
                      Asking question aloud...
                    </span>
                  )}
                  {isListening && (
                    <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-danger animate-pulse">
                      <Radio className="h-3 w-3" />
                      Candidate Speaking...
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-soft">
                  {isSpeaking
                    ? 'Interviewer is speaking. Listen carefully to the question.'
                    : isListening
                    ? 'Microphone is active. Speak your answer clearly.'
                    : 'Question is displayed on screen and read aloud.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-slate-50 transition"
                  title="Pause interviewer voice"
                >
                  <Square className="h-3.5 w-3.5" /> Stop voice
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => speakQuestion(q.text)}
                  className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-100 transition shadow-sm"
                  title="Repeat question aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Repeat question
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setAutoSpeak((v) => !v);
                  if (isSpeaking) stopSpeaking();
                  toast(autoSpeak ? 'Interviewer voice muted' : 'Interviewer voice enabled');
                }}
                className={`rounded-xl border p-2 transition ${
                  autoSpeak
                    ? 'border-primary/30 bg-primary-50 text-primary hover:bg-primary-100'
                    : 'border-slate-200 bg-white text-ink-mute hover:bg-slate-50'
                }`}
                title={autoSpeak ? 'Auto-speak enabled (Click to mute)' : 'Auto-speak muted (Click to enable)'}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Question Details */}
          <div className="flex gap-2">
            <span className="chip">{q.category}</span>
            {q.skill && <span className="chip bg-secondary-50 text-secondary">{q.skill}</span>}
          </div>
          <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl text-ink">{q.text}</h2>

          {/* Candidate Answer Box with Voice and Typing */}
          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Your Answer</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse hover:bg-red-600 ring-4 ring-red-200'
                      : 'border border-primary bg-primary text-white hover:bg-primary-600'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-current" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5" /> Speak Answer
                    </>
                  )}
                </button>
                {answers[index]?.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear your answer for this question?')) {
                        setAnswers((a) => a.map((v, i) => (i === index ? '' : v)));
                      }
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-mute hover:border-red-200 hover:text-danger transition"
                    title="Clear text"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {isListening && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-2.5 text-xs text-red-900">
                <Radio className="h-4 w-4 shrink-0 text-red-600 animate-pulse" />
                <span className="font-semibold">Microphone active:</span>
                <span className="italic">{interimTranscript || 'Listening... start speaking your answer now'}</span>
              </div>
            )}

            <textarea
              className="input min-h-[200px] resize-y leading-relaxed font-normal"
              placeholder="Speak using the 'Speak Answer' microphone button above, or type directly here. You can speak and edit freely."
              value={answers[index]}
              maxLength={5000}
              onChange={(e) => setAnswers((a) => a.map((v, i) => (i === index ? e.target.value : v)))}
            />
            <div className="mt-1 flex items-center justify-between text-xs text-ink-mute">
              <span>You can speak, type, or combine both anytime.</span>
              <span>{answers[index].length}/5000</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <div className="hidden gap-1.5 sm:flex">
          {interview.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index ? 'scale-125 bg-primary' : answers[i]?.trim() ? 'bg-success' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
        {last ? (
          <button className="btn-primary" onClick={finish}>
            <Send className="h-4 w-4" /> Submit interview
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setIndex(index + 1)}>
            Next question <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
