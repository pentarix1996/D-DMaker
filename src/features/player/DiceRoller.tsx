import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Dices, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type DiceResult = {
    id: string;
    value: number;
    max: number;
};

export const DiceRoller = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<DiceResult[]>([]);
    const [isRolling, setIsRolling] = useState(false);

    const rollDice = useCallback((max: number) => {
        if (isRolling) return;
        setIsRolling(true);
        // Play sound if available (optional)

        // Clear previous results to enforce the new roll feeling
        setResults([]);

        // Fake "rolling" animation delay
        setTimeout(() => {
            const newValue = Math.floor(Math.random() * max) + 1;
            setResults(prev => [{ id: Math.random().toString(), value: newValue, max }, ...prev].slice(0, 5));
            setIsRolling(false);
        }, 600);
    }, [isRolling]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
            {/* Results Panel */}
            <div className={cn(
                "bg-fantasy-dark/95 border border-white/10 backdrop-blur-md rounded-lg p-3 w-64 transition-all duration-300 transform origin-bottom-right drop-shadow-2xl",
                isOpen ? "scale-100 opacity-100 mb-2" : "scale-0 opacity-0 mb-0 pointer-events-none"
            )}>
                <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                    <h3 className="text-fantasy-gold font-cinzel text-sm">Tiradas</h3>
                    <button onClick={() => setIsOpen(false)} className="text-fantasy-muted hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[4, 6, 8, 10, 12, 20].map((sides) => (
                        <Button
                            key={`d${sides}`}
                            variant="secondary"
                            size="sm"
                            className={cn(
                                "flex items-center justify-center font-mono py-6 border border-white/5 hover:border-fantasy-accent bg-black/40 hover:bg-fantasy-accent/20 transition-all",
                                isRolling && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => rollDice(sides)}
                            disabled={isRolling}
                        >
                            d{sides}
                        </Button>
                    ))}
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {results.length === 0 && !isRolling && (
                        <div className="text-center text-xs text-fantasy-muted italic py-2">
                            Lanza un dado...
                        </div>
                    )}
                    {isRolling && (
                        <div className="flex justify-center items-center py-2 animate-pulse text-fantasy-gold">
                            <Dices className="w-5 h-5 animate-spin" />
                        </div>
                    )}
                    {!isRolling && results.map((result, idx) => (
                        <div
                            key={result.id}
                            className={cn(
                                "flex justify-between items-center bg-black/60 p-2 rounded border-l-2",
                                result.value === result.max ? "border-l-green-500 text-green-400 font-bold" :
                                    result.value === 1 ? "border-l-red-500 text-red-500 font-bold" : "border-l-fantasy-accent text-white"
                            )}
                            style={{ animation: `fade-in 0.3s ease-out ${idx * 0.1}s both` }}
                        >
                            <span className="text-xs text-fantasy-muted">d{result.max}</span>
                            <span className="text-lg font-cinzel">{result.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full w-14 h-14 shadow-lg shadow-black/50 transition-all duration-300 group flex items-center justify-center border-2 border-transparent",
                    isOpen ? "bg-fantasy-accent text-white border-white/20" : "bg-fantasy-dark border-white/10 hover:border-fantasy-gold text-fantasy-muted hover:text-fantasy-gold"
                )}
            >
                <Dices className={cn("w-6 h-6 transition-transform duration-500", isOpen && "rotate-180")} />
            </Button>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
