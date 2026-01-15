import React, { useCallback, useRef, useState, useEffect } from 'react';

interface QuarterLabel {
  timestamp: number;
  label: string;
}

interface DateRangeSliderProps {
  minDate: number;
  maxDate: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  quarterLabels: QuarterLabel[];
}

export default function DateRangeSlider({
  minDate,
  maxDate,
  value,
  onChange,
  quarterLabels,
}: DateRangeSliderProps): JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  // Refs to store latest value and onChange to avoid useCallback recreation during drag
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Keep refs updated with latest values
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);



  // Convert timestamp to percentage position
  const timestampToPercent = useCallback(
    (timestamp: number): number => {
      if (maxDate === minDate) return 0;
      return ((timestamp - minDate) / (maxDate - minDate)) * 100;
    },
    [minDate, maxDate]
  );

  // Convert percentage to nearest quarter timestamp
  const percentToQuarter = useCallback(
    (percent: number): number => {
      const timestamp = minDate + (percent / 100) * (maxDate - minDate);
      // Find nearest quarter
      let nearest = quarterLabels[0]?.timestamp ?? minDate;
      let minDist = Math.abs(timestamp - nearest);

      for (const q of quarterLabels) {
        const dist = Math.abs(timestamp - q.timestamp);
        if (dist < minDist) {
          minDist = dist;
          nearest = q.timestamp;
        }
      }

      return nearest;
    },
    [minDate, maxDate, quarterLabels]
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!dragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const newTimestamp = percentToQuarter(percent);

      const currentValue = valueRef.current;
      const currentOnChange = onChangeRef.current;

      if (dragging === 'min') {
        // Ensure min doesn't exceed max
        const newMin = Math.min(newTimestamp, currentValue[1]);
        if (newMin !== currentValue[0]) {
          currentOnChange([newMin, currentValue[1]]);
        }
      } else {
        // Ensure max doesn't go below min
        const newMax = Math.max(newTimestamp, currentValue[0]);
        if (newMax !== currentValue[1]) {
          currentOnChange([currentValue[0], newMax]);
        }
      }
    },
    [dragging, percentToQuarter]
  );

  // Mouse event handlers
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMove]);

  // Touch event handlers
  useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      setDragging(null);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, handleMove]);

  const minPercent = timestampToPercent(value[0]);
  const maxPercent = timestampToPercent(value[1]);

  // Get labels for current selection
  const getQuarterLabel = (timestamp: number): string => {
    const match = quarterLabels.find((q) => q.timestamp === timestamp);
    return match?.label ?? '';
  };

  // Determine which tick labels to show (avoid overcrowding)
  const visibleTicks = quarterLabels.filter((_, idx) => {
    // Show every tick if <= 8, otherwise show every other
    if (quarterLabels.length <= 8) return true;
    if (quarterLabels.length <= 16) return idx % 2 === 0;
    return idx % 4 === 0;
  });

  return (
    <div className="tci-date-slider">
      <div className="tci-date-slider__header">
        <span className="tci-date-slider__title">Release Date Range</span>
        <span className="tci-date-slider__selected">
          {getQuarterLabel(value[0])} – {getQuarterLabel(value[1])}
        </span>
      </div>

      <div className="tci-date-slider__track-container">
        <div className="tci-date-slider__track" ref={trackRef}>
          {/* Highlighted range */}
          <div
            className="tci-date-slider__range"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Min thumb */}
          <div
            className={`tci-date-slider__thumb tci-date-slider__thumb--min ${dragging === 'min' ? 'tci-date-slider__thumb--active' : ''}`}
            style={{ left: `${minPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDragging('min');
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDragging('min');
            }}
            role="slider"
            aria-label="Minimum date"
            aria-valuemin={minDate}
            aria-valuemax={maxDate}
            aria-valuenow={value[0]}
            tabIndex={0}
          />

          {/* Max thumb */}
          <div
            className={`tci-date-slider__thumb tci-date-slider__thumb--max ${dragging === 'max' ? 'tci-date-slider__thumb--active' : ''}`}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDragging('max');
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              setDragging('max');
            }}
            role="slider"
            aria-label="Maximum date"
            aria-valuemin={minDate}
            aria-valuemax={maxDate}
            aria-valuenow={value[1]}
            tabIndex={0}
          />
        </div>
      </div>

      {/* Tick labels */}
      <div className="tci-date-slider__labels">
        {visibleTicks.map((q) => (
          <span
            key={q.timestamp}
            className={`tci-date-slider__label ${
              q.timestamp >= value[0] && q.timestamp <= value[1]
                ? 'tci-date-slider__label--active'
                : ''
            }`}
            style={{ left: `${timestampToPercent(q.timestamp)}%` }}
          >
            {q.label}
          </span>
        ))}
      </div>
    </div>
  );
}
