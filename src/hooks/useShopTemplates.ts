import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { ShopCatalogItem, ShopTemplate } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useShopTemplates = () => {
    const templates = useLiveQuery(
        () => db.shopTemplates.orderBy('name').toArray(),
        []
    );

    const addTemplate = async (name: string, items: ShopCatalogItem[] = []) => {
        const template: ShopTemplate = {
            id: uuidv4(),
            name,
            items
        };
        await db.shopTemplates.add(template);
        return template.id;
    };

    const updateTemplate = async (id: string, updates: Partial<ShopTemplate>) => {
        await db.shopTemplates.update(id, updates);
    };

    const deleteTemplate = async (id: string) => {
        await db.shopTemplates.delete(id);
    };

    return {
        templates: templates ?? [],
        addTemplate,
        updateTemplate,
        deleteTemplate,
        isLoading: !templates
    };
};
