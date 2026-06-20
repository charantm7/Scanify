'use client';

import React from 'react';

interface PillSelectProps {
    options: readonly string[];
    selected: string[];
    onToggle: (value: string) => void;
}

export function PillSelect({ options, selected, onToggle }: PillSelectProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onToggle(option)}
                        aria-pressed={isSelected}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                        style={{
                            background: isSelected ? 'var(--accent)' : 'transparent',
                            borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                            color: isSelected ? '#fff' : 'var(--text2)',
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
}