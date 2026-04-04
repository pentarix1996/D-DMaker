import { create } from 'zustand';
import type { Story, Scene } from '@/types';

interface GameState {
    // Session
    activeStory: Story | null;
    activeSceneId: string | null;
    scenes: Scene[];

    // Editor State
    isEditMode: boolean; // false = Player Mode

    // Actions
    loadStory: (story: Story, scenes: Scene[]) => void;
    setActiveScene: (sceneId: string) => void;
    setEditMode: (isEdit: boolean) => void;

    // Scene Mutations
    addScene: (scene: Scene) => void;
    updateScene: (sceneId: string, updates: Partial<Scene>) => void;
    deleteScene: (sceneId: string) => void;
    reorderScenes: (orderedSceneIds: string[]) => void;

    // Helpers
    getCurrentScene: () => Scene | undefined;
}

export const useGameStore = create<GameState>((set, get) => ({
    activeStory: null,
    activeSceneId: null,
    scenes: [],
    isEditMode: true,

    loadStory: (story, scenes) => set({
        activeStory: story,
        scenes: scenes.sort((a, b) => a.order - b.order),
        activeSceneId: scenes.length > 0 ? scenes[0].id : null
    }),

    setActiveScene: (id) => set({ activeSceneId: id }),
    setEditMode: (mode) => set({ isEditMode: mode }),

    addScene: (scene) => set((state) => ({
        scenes: [...state.scenes, scene].sort((a, b) => a.order - b.order),
        activeSceneId: scene.id // Switch to new scene
    })),

    updateScene: (id, updates) => set((state) => ({
        scenes: state.scenes.map(s => s.id === id ? { ...s, ...updates } : s)
    })),

    deleteScene: (id) => set((state) => ({
        scenes: state.scenes.filter(s => s.id !== id),
        activeSceneId: state.activeSceneId === id ? null : state.activeSceneId
    })),

    reorderScenes: (orderedSceneIds) => set((state) => {
        const sceneMap = new Map(state.scenes.map((scene) => [scene.id, scene]));
        const reordered = orderedSceneIds
            .map((id) => sceneMap.get(id))
            .filter((scene): scene is Scene => Boolean(scene))
            .map((scene, index) => ({ ...scene, order: index }));

        const missing = state.scenes
            .filter((scene) => !orderedSceneIds.includes(scene.id))
            .map((scene, index) => ({ ...scene, order: reordered.length + index }));

        return {
            scenes: [...reordered, ...missing]
        };
    }),

    getCurrentScene: () => {
        const { scenes, activeSceneId } = get();
        return scenes.find(s => s.id === activeSceneId);
    }
}));
