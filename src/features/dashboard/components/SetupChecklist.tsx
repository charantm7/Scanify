import { Check, Circle } from 'lucide-react';
import { Card } from '../../../components/ui/UiComponents';

type ChecklistItem = { label: string; done: boolean; onClick?: () => void };

export function SetupChecklist({ items }: { items: ChecklistItem[] }) {
    const remaining = items.filter((i) => !i.done).length;
    if (remaining === 0) return null; // fully set up — stop nagging

    return (
        <Card>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-theme">Finish setting up</p>
                <span className="text-xs text-theme2">{items.length - remaining}/{items.length} done</span>
            </div>
            <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        disabled={item.done || !item.onClick}
                        className="flex items-center gap-2.5 text-left text-sm disabled:cursor-default"
                    >
                        {item.done
                            ? <Check size={16} className="text-green-600 flex-shrink-0" />
                            : <Circle size={16} className="text-theme3 flex-shrink-0" />}
                        <span className={item.done ? 'text-theme2 line-through' : 'text-theme'}>{item.label}</span>
                    </button>
                ))}
            </div>
        </Card>
    );
}