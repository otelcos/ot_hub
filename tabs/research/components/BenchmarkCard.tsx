import React from 'react';
import Link from '@docusaurus/Link';

interface BenchmarkCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  sampleCount?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  link?: string;
  paperLink?: string;
  datasetLink?: string;
}

const getDifficultyClass = (difficulty: 'easy' | 'medium' | 'hard') => {
  switch (difficulty) {
    case 'easy': return 'badge-easy';
    case 'medium': return 'badge-medium';
    case 'hard': return 'badge-hard';
  }
};

export default function BenchmarkCard({
  title,
  description,
  icon,
  sampleCount,
  difficulty,
  link,
  paperLink,
  datasetLink,
}: BenchmarkCardProps): JSX.Element {
  const cardContent = (
    <>
      <div className="benchmark-card-header">
        {icon && (
          <div className="benchmark-card-icon">
            {icon}
          </div>
        )}
        <div className="benchmark-card-title-area">
          <h3 className="benchmark-card-title">{title}</h3>
          <div className="benchmark-card-badges">
            {sampleCount && (
              <span className="badge badge-samples">{sampleCount}</span>
            )}
            {difficulty && (
              <span className={`badge ${getDifficultyClass(difficulty)}`}>
                {difficulty}
              </span>
            )}
          </div>
        </div>
        {link && (
          <span className="benchmark-card-arrow">→</span>
        )}
      </div>
      <p className="benchmark-card-description">{description}</p>
      {(paperLink || datasetLink) && (
        <div className="benchmark-card-footer">
          {paperLink && (
            <a
              href={paperLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Paper
            </a>
          )}
          {datasetLink && (
            <a
              href={datasetLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Dataset
            </a>
          )}
        </div>
      )}
    </>
  );

  if (link) {
    return (
      <Link to={link} className="benchmark-card-enhanced benchmark-card-clickable">
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="benchmark-card-enhanced">
      {cardContent}
    </div>
  );
}
