import React, { useMemo, useState, useRef } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { BenchmarkQuestion, MCQQuestion, OpenEndedQuestion, LogAnalysisQuestion, TextClassificationQuestion } from '../types/leaderboard';
import { useLeaderboardData } from '../hooks/useLeaderboardData';
import { calculateRankings } from '../utils/rankings';
import { calculateBarWidth } from '../utils/chartUtils';
import { BENCHMARKS } from '../constants/benchmarks';
import RankingRow from './RankingRow';

// Render text with inline LaTeX math (delimited by $...$)
function renderMathText(text: string): string {
  // Replace $...$ with rendered KaTeX HTML
  return text.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      });
    } catch (e) {
      return `$${math}$`;
    }
  });
}

interface BenchmarkDetailPageProps {
  benchmarkKey: string;
}

// TCI-specific configuration
const TCI_CONFIG = {
  key: 'tci',
  title: 'Telco Capability Index (TCI)',
  longDescription: `The Telco Capability Index (TCI) provides a standardized score for comparing AI model performance across telecommunications domains. Using Item Response Theory (IRT) inspired methodology, TCI weighs each benchmark by its difficulty and discrimination power, producing scores on a normalized scale centered at 115.

Models must complete at least 3 of 5 benchmarks to receive a TCI score. This ensures meaningful comparisons even when some benchmark results are missing.`,
  samples: '5 benchmarks',
};

// Question Card Components
interface QuestionCardProps {
  question: BenchmarkQuestion;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function MCQQuestionCard({ question, index }: { question: MCQQuestion; index: number }) {
  return (
    <div className="question-card question-card--mcq">
      <div className="question-number">Q{index + 1}</div>
      <p className="question-text">{question.question}</p>
      <div className="question-options">
        {question.options.map((option, optIdx) => (
          <div key={optIdx} className="question-option">
            {String.fromCharCode(65 + optIdx)}. {option}
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenEndedQuestionCard({ question, index }: { question: OpenEndedQuestion; index: number }) {
  return (
    <div className="question-card question-card--open-ended">
      <div className="question-number">Q{index + 1}</div>
      <p
        className="question-text question-text--math"
        dangerouslySetInnerHTML={{ __html: renderMathText(question.question) }}
      />
      <div className="question-format-hint">
        <span className="format-tag">Open-ended</span>
      </div>
    </div>
  );
}

function LogAnalysisQuestionCard({ question, index }: { question: LogAnalysisQuestion; index: number }) {
  return (
    <div className="question-card question-card--log-analysis">
      <div className="question-number">Q{index + 1}</div>
      <p className="question-text">{question.prompt}</p>
      <div className="question-table-wrapper">
        <table className="question-table">
          <thead>
            <tr>
              {question.tableExcerpt.headers.map((header, hIdx) => (
                <th key={hIdx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.tableExcerpt.rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="question-options">
        {question.options.map((option, optIdx) => (
          <div key={optIdx} className="question-option">
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}

function TextClassificationQuestionCard({ question, index }: { question: TextClassificationQuestion; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncateLength = 300;
  const needsTruncation = question.passage.length > truncateLength;

  return (
    <div className="question-card question-card--text-classification">
      <div className="question-number">Q{index + 1}</div>
      <div className="question-passage-label">Identify the 3GPP Working Group for this passage:</div>
      <div className={`passage-text ${isExpanded ? 'expanded' : ''}`}>
        <p className="question-text">
          {needsTruncation && !isExpanded
            ? question.passage.substring(0, truncateLength) + '...'
            : question.passage
          }
        </p>
      </div>
      {needsTruncation && (
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
      <div className="question-options question-options--inline">
        {question.options.map((option, optIdx) => (
          <div key={optIdx} className="question-option question-option--chip">
            {option}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, index, isExpanded, onToggle }: QuestionCardProps) {
  const accordionRef = useRef<HTMLDivElement>(null);

  const getQuestionPreview = () => {
    let text = '';
    if (question.type === 'mcq') text = question.question;
    else if (question.type === 'open-ended') text = question.question;
    else if (question.type === 'log-analysis') text = question.prompt;
    else if (question.type === 'text-classification') text = 'Identify the 3GPP Working Group...';
    // Truncate preview
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  };

  const getTypeLabel = () => {
    if (question.type === 'mcq') return 'MCQ';
    if (question.type === 'open-ended') return 'Open-ended';
    if (question.type === 'log-analysis') return 'Log Analysis';
    if (question.type === 'text-classification') return 'Classification';
    return '';
  };

  const getTypeClass = () => {
    return `question-type-badge question-type-badge--${question.type}`;
  };

  return (
    <div ref={accordionRef} className={`question-accordion ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="accordion-toggle" onClick={onToggle}>
        <div className="accordion-header">
          <span className="accordion-number">Q{index + 1}</span>
          <span className={getTypeClass()}>{getTypeLabel()}</span>
          {!isExpanded && <span className="accordion-preview">{getQuestionPreview()}</span>}
        </div>
        <span className="accordion-icon">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && (
        <div className="accordion-content">
          {question.type === 'mcq' && <MCQQuestionCard question={question} index={index} />}
          {question.type === 'open-ended' && <OpenEndedQuestionCard question={question} index={index} />}
          {question.type === 'log-analysis' && <LogAnalysisQuestionCard question={question} index={index} />}
          {question.type === 'text-classification' && <TextClassificationQuestionCard question={question} index={index} />}
        </div>
      )}
    </div>
  );
}

export default function BenchmarkDetailPage({
  benchmarkKey,
}: BenchmarkDetailPageProps): JSX.Element {
  const { data, loading, error } = useLeaderboardData();
  const isTCI = benchmarkKey === 'tci';
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  // Get benchmark config
  const benchmark = isTCI
    ? TCI_CONFIG
    : BENCHMARKS.find(b => b.key === benchmarkKey);

  // Calculate rankings
  const rankings = useMemo(() => {
    return calculateRankings(data, benchmarkKey);
  }, [data, benchmarkKey]);

  // Calculate bar widths
  const scores = rankings.map(r => r.score);
  const getBarWidth = (score: number) => {
    if (rankings.length === 0) return 0;
    return calculateBarWidth(score, scores, { isPercentage: !isTCI });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (!benchmark) {
    return (
      <Layout title="Benchmark Not Found">
        <div className="benchmark-detail-page">
          <div className="benchmark-not-found">
            <h1>Benchmark Not Found</h1>
            <p>The requested benchmark "{benchmarkKey}" does not exist.</p>
            <Link to="/leaderboard" className="back-link">&larr; Back to Leaderboard</Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title={benchmark.title}>
        <div className="benchmark-detail-page">
          <div className="benchmark-loading">Loading leaderboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={benchmark.title}>
        <div className="benchmark-detail-page">
          <div className="benchmark-error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  const isComingSoon = !isTCI && 'comingSoon' in benchmark && benchmark.comingSoon;
  const hasQuestions = !isTCI && 'questions' in benchmark && benchmark.questions && benchmark.questions.length > 0;

  return (
    <Layout title={`${benchmark.title} | Leaderboard`} description={'description' in benchmark ? benchmark.description : benchmark.longDescription}>
      <div className="benchmark-detail-page">
        <Link to="/leaderboard" className="back-link">
          <span className="back-arrow">&larr;</span> Back to Leaderboard
        </Link>

        {/* Page Header */}
        <div className="benchmark-page-header">
          <div className="benchmark-title-group">
            <h1 className="benchmark-page-title">
              {benchmark.title}
              {isComingSoon && <span className="coming-soon-badge">Coming Soon</span>}
            </h1>
            <p className="benchmark-page-subtitle">
              Want to add your model to the leaderboard?{' '}
              <a href="https://github.com/otelcos/leaderboard" target="_blank" rel="noopener noreferrer">
                Go here
              </a>
            </p>
          </div>
          {!isTCI && ('paperLink' in benchmark || 'datasetLink' in benchmark || hasQuestions) && (
            <div className="benchmark-header-links">
              {'paperLink' in benchmark && benchmark.paperLink && (
                <a href={benchmark.paperLink} target="_blank" rel="noopener noreferrer" className="header-link">
                  Paper
                </a>
              )}
              {'datasetLink' in benchmark && benchmark.datasetLink && (
                <a href={benchmark.datasetLink} target="_blank" rel="noopener noreferrer" className="header-link">
                  Dataset
                </a>
              )}
              {hasQuestions && (
                <a href="#questions" className="header-link">
                  Questions
                </a>
              )}
            </div>
          )}
        </div>

        {/* Full Width Leaderboard */}
        <div className="benchmark-content">
            {!isComingSoon && (
              <div className="leaderboard-card full-ranking-card">
                <div className="full-ranking-header">
                  <span className="ranking-count">{rankings.length} models</span>
                </div>
                <div className="leaderboard-rankings">
                  {rankings.map((entry, index) => (
                    <RankingRow
                      key={`${entry.model}-${index}`}
                      rank={entry.rank}
                      model={entry.model}
                      provider={entry.provider}
                      score={entry.score}
                      error={entry.error}
                      barWidth={getBarWidth(entry.score)}
                      showProviderIcon={true}
                      isNew={entry.isNew}
                    />
                  ))}
                </div>
              </div>
            )}

            {isComingSoon && (
              <div className="leaderboard-card full-ranking-card coming-soon-card">
                <div className="coming-soon-content">
                  <div className="coming-soon-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <h3>Leaderboard Coming Soon</h3>
                  <p>We're currently evaluating models on this benchmark. Check back soon for results.</p>
                </div>
              </div>
            )}

          {/* Questions Section */}
          {hasQuestions && 'questions' in benchmark && benchmark.questions && (
            <div id="questions" className="benchmark-questions-section">
              <h2 className="questions-section-title">Example Questions</h2>
              <div className="questions-list">
                {benchmark.questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    question={q}
                    index={idx}
                    isExpanded={expandedQuestions.has(idx)}
                    onToggle={() => toggleQuestion(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
