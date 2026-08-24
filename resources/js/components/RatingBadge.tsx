import React from 'react';
import { getRatingInterpretation } from '@/lib/rating';

interface RatingBadgeProps {
    score: number | string | null | undefined;
    showScore?: boolean;
}

export default function RatingBadge({ score, showScore = true }: RatingBadgeProps) {
    const { scale, label, color } = getRatingInterpretation(score);

    if (label === 'No Rating') {
        return <span className="text-sm text-gray-400">N/A</span>;
    }

    return (
        <div className="inline-flex items-center gap-2">
            {showScore && <span className="font-semibold text-gray-900">{score}</span>}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                {scale} ({label})
            </span>
        </div>
    );
}
