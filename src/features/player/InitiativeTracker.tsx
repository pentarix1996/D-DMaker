import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Swords, Plus, X, ArrowDown, ArrowUp, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

type Actor = {
    id: string;
    name: string;
    initiative: number;
    hp?: number;
    isEnemy: boolean;
};

export const InitiativeTracker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [actors, setActors] = useState<Actor[]>([]);
    const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newInit, setNewInit] = useState('');
    const [isEnemy, setIsEnemy] = useState(false);

    const sortActors = (list: Actor[]) => [...list].sort((a, b) => b.initiative - a.initiative);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newInit) return;

        const newActor: Actor = {
            id: uuidv4(),
            name: newName,
            initiative: parseInt(newInit) || 0,
            isEnemy
        };

        const newList = sortActors([...actors, newActor]);
        setActors(newList);

        // Form reset
        setNewName('');
        setNewInit('');
        if (!currentTurnId && newList.length > 0) {
            setCurrentTurnId(newList[0].id);
        }
    };

    const handleRemove = (id: string) => {
        const newList = actors.filter(a => a.id !== id);
        setActors(newList);

        if (currentTurnId === id) {
            // Need to pass turn if current dies
            nextTurn(newList);
        }
    };

    const nextTurn = (list = actors) => {
        if (list.length === 0) {
            setCurrentTurnId(null);
            return;
        }

        const currentIndex = list.findIndex(a => a.id === currentTurnId);
        if (currentIndex === -1 || currentIndex === list.length - 1) {
            // Back to top
            setCurrentTurnId(list[0].id);
        } else {
            setCurrentTurnId(list[currentIndex + 1].id);
        }
    };

    const prevTurn = () => {
        if (actors.length === 0) return;
        const currentIndex = actors.findIndex(a => a.id === currentTurnId);
        if (currentIndex <= 0) {
            // Go to bottom
            setCurrentTurnId(actors[actors.length - 1].id);
        } else {
            setCurrentTurnId(actors[currentIndex - 1].id);
        }
    };

    const clearAll = () => {
        if (confirm("Reset initiative?")) {
            setActors([]);
            setCurrentTurnId(null);
        }
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 pointer-events-auto">
            {/* Main Panel */}
            <div className={cn(
                "bg-fantasy-dark/95 border border-white/10 backdrop-blur-md rounded-lg p-4 w-72 flex flex-col transition-all duration-300 transform origin-bottom-left drop-shadow-2xl shadow-black max-h-[70vh]",
                isOpen ? "scale-100 opacity-100 mb-2" : "scale-0 opacity-0 mb-0 pointer-events-none"
            )}>
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                    <h3 className="text-fantasy-gold font-cinzel text-sm">Iniciativa</h3>
                    <div className="flex gap-2">
                        {actors.length > 0 && (
                            <button onClick={clearAll} className="text-fantasy-muted hover:text-red-400 transition-colors" title="Clear all">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <button onClick={() => setIsOpen(false)} className="text-fantasy-muted hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="flex gap-1 mb-4 h-8">
                    <input
                        className={cn("flex-1 bg-black/50 border rounded px-2 text-sm focus:outline-none focus:border-fantasy-gold", isEnemy ? "border-red-900/50" : "border-white/10")}
                        placeholder="Name..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                        maxLength={15}
                    />
                    <input
                        type="number"
                        className="w-12 bg-black/50 border border-white/10 rounded px-1 text-sm text-center focus:outline-none focus:border-fantasy-gold"
                        placeholder="Init"
                        value={newInit}
                        onChange={e => setNewInit(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsEnemy(!isEnemy)}
                        className={cn("px-2 rounded border transition-colors text-xs", isEnemy ? "bg-red-900/40 border-red-500/50 text-red-100" : "bg-blue-900/40 border-blue-500/50 text-blue-100")}
                        title="Toggle Enemy/Ally"
                    >
                        {isEnemy ? 'ENM' : 'PLY'}
                    </button>
                    <Button type="submit" size="icon" className="h-8 w-8 px-0" variant="primary">
                        <Plus className="w-4 h-4" />
                    </Button>
                </form>

                {/* Actor List */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {actors.length === 0 && (
                        <div className="text-center text-xs text-fantasy-muted italic py-4">
                            Sin actores en combate.
                        </div>
                    )}
                    {actors.map((actor) => {
                        const isTurn = actor.id === currentTurnId;
                        return (
                            <div
                                key={actor.id}
                                className={cn(
                                    "group flex items-center justify-between p-2 rounded transition-all",
                                    actor.isEnemy ? "bg-red-950/30 border-l-2 border-red-500" : "bg-blue-950/30 border-l-2 border-blue-500",
                                    isTurn && "ring-1 ring-fantasy-gold bg-black/60 scale-[1.02] translate-x-1 shadow-lg"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn("font-bold font-mono text-sm w-6 text-center", isTurn ? "text-fantasy-gold" : "text-fantasy-muted")}>
                                        {actor.initiative}
                                    </span>
                                    <span className={cn("text-sm truncate w-28", actor.isEnemy ? "text-red-200" : "text-blue-200", isTurn && "font-bold text-white")}>
                                        {actor.name}
                                    </span>
                                </div>
                                <button onClick={() => handleRemove(actor.id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Turn Controls */}
                {actors.length > 0 && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button variant="secondary" className="flex-1 text-xs h-8" onClick={prevTurn}>
                            <ArrowUp className="w-3 h-3 mr-1" /> Ant.
                        </Button>
                        <Button variant="primary" className="flex-1 text-xs h-8 bg-fantasy-accent text-white" onClick={() => nextTurn(actors)}>
                            Siguiente <ArrowDown className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full w-14 h-14 shadow-lg shadow-black/50 transition-all duration-300 flex items-center justify-center border-2 border-transparent",
                    isOpen ? "bg-fantasy-accent text-white border-white/20" : "bg-fantasy-dark border-white/10 hover:border-fantasy-gold text-fantasy-muted hover:text-fantasy-gold",
                    actors.length > 0 && !isOpen ? "animate-pulse shadow-sm shadow-fantasy-gold" : ""
                )}
            >
                <Swords className="w-6 h-6" />
                {actors.length > 0 && !isOpen && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white shadow-md">
                        {actors.length}
                    </div>
                )}
            </Button>
        </div>
    );
};
