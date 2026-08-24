export interface RatingInterpretation {
    scale: number | string;
    label: string;
    color: string;
}

export function getRatingInterpretation(score: number | string | null | undefined): RatingInterpretation {
    const num = typeof score === 'number' ? score : parseFloat(score ?? '');

    if (isNaN(num) || num <= 0) {
        return {
            scale: 'N/A',
            label: 'No Rating',
            color: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }

    if (num >= 4.75) {
        return { scale: 5, label: 'Outstanding', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (num >= 3.50) {
        return { scale: 4, label: 'Very Satisfied', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (num >= 2.50) {
        return { scale: 3, label: 'Moderately Satisfied', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    if (num >= 1.50) {
        return { scale: 2, label: 'Slightly Satisfied', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    }
    return { scale: 1, label: 'Not Satisfied', color: 'bg-red-100 text-red-800 border-red-300' };
}
