import { Vault } from '@/features/vault/Vault';
import { EditorCanvas } from '@/features/editor/EditorCanvas';
import { Timeline } from '@/features/editor/Timeline';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { db } from '@/db';

interface EditorViewProps {
    onNavigate: (view: 'HOME') => void;
}

export const EditorView = ({ onNavigate }: EditorViewProps) => {
    const { scenes, activeStory } = useGameStore();

    const handleSave = async () => {
        if (!activeStory) return;
        await db.scenes.bulkPut(scenes);
        await db.stories.update(activeStory.id, { lastPlayed: new Date().toISOString() });
        alert('Progress Saved!');
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-fantasy-bg flex">
            {/* Vault (Fixed internally) */}
            <Vault allowedTypes={['map', 'token', 'audio']} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-80 h-full relative z-10">
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <Button variant="secondary" onClick={() => onNavigate('HOME')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save Progress
                    </Button>
                </div>

                <EditorCanvas />
                <Timeline />
            </div>
        </div>
    );
};
