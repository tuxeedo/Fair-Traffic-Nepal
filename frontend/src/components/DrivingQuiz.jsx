import { useState } from 'react';
import { DRIVING_QUESTIONS, QUIZ_SOURCES, createPracticeSet } from '../data/drivingQuiz';

export default function DrivingQuiz() {
  const [topic, setTopic] = useState('All topics');
  const [questions, setQuestions] = useState(() => createPracticeSet());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const answered = Object.keys(answers).length;
  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const start = nextTopic => {
    setTopic(nextTopic); setQuestions(createPracticeSet(nextTopic)); setAnswers({}); setSubmitted(false);
  };
  return <section className="glass-card driving-quiz">
    <span className="section-eyebrow">Learn • practise • review</span>
    <h2>Nepal driving knowledge quiz</h2>
    <p className="quiz-intro">Practise with {DRIVING_QUESTIONS.length} questions on road rules, signs, riding safely, vehicle care, and emergencies. Each set includes up to 10 questions.</p>
    <div className="quiz-source-note">Practice material, not an official exam paper. Exam-topic questions adapt concepts from the <a href={QUIZ_SOURCES.collection} target="_blank" rel="noopener noreferrer">DoTM category B collection (2078)</a>; other questions teach everyday safety. Find current A/K and B exam materials at the <a href={QUIZ_SOURCES.current} target="_blank" rel="noopener noreferrer">Transport Management Office</a>.</div>
    <div className="quiz-toolbar"><label htmlFor="quiz-topic">Choose a topic<select id="quiz-topic" className="form-select" value={topic} onChange={e => start(e.target.value)}>{['All topics', ...new Set(DRIVING_QUESTIONS.map(q => q.topic))].map(value => <option key={value}>{value}</option>)}</select></label><button className="btn btn-ghost" onClick={() => start(topic)}>New practice set</button></div>
    <div className="quiz-progress" role="status">{submitted ? `${score} of ${questions.length} correct · ${Math.round(score / questions.length * 100)}%` : `${answered} of ${questions.length} answered`}<progress max={questions.length} value={answered} aria-label="Questions answered" /></div>
    {submitted && <div className="quiz-result" role="status"><strong>{score === questions.length ? 'Great work!' : 'Review your answers below'}</strong><p>Explanations help you understand each answer. Your practice result does not change your driver safety score.</p></div>}
    <div className="quiz-questions">{questions.map((q, index) => <fieldset key={index} className="quiz-question">
      <legend>{index + 1}. {q.question}</legend>
      <span className="quiz-topic-label">{q.topic} · {q.exam ? 'Exam-topic practice' : 'Road-safety learning'}</span>
      <div className="quiz-options">{q.options.map((option, optionIndex) => <label key={optionIndex} className={`quiz-option ${answers[index] === optionIndex ? 'is-selected' : ''} ${submitted && optionIndex === q.correct ? 'is-correct' : ''} ${submitted && answers[index] === optionIndex && optionIndex !== q.correct ? 'is-incorrect' : ''}`}>
        <input type="radio" name={`question-${index}`} value={optionIndex} checked={answers[index] === optionIndex} disabled={submitted} onChange={() => setAnswers(previous => ({ ...previous, [index]: optionIndex }))} />
        <span>{String.fromCharCode(65 + optionIndex)}. {option}{submitted && optionIndex === q.correct && <strong> — Correct answer</strong>}{submitted && answers[index] === optionIndex && optionIndex !== q.correct && <strong> — Your answer</strong>}</span>
      </label>)}</div>
      {submitted && <p className="quiz-explanation"><strong>{answers[index] === q.correct ? 'Correct.' : 'Keep learning.'}</strong> {q.explanation}</p>}
    </fieldset>)}</div>
    <div className="quiz-actions">{submitted ? <button className="btn btn-primary" onClick={() => start(topic)}>Try another set</button> : <><button className="btn btn-primary" disabled={answered !== questions.length} onClick={() => setSubmitted(true)}>Submit & check answers</button><span>Answer every question to see your result.</span></>}</div>
  </section>;
}
