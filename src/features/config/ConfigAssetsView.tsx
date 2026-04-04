import { useMemo, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type {
    AbilityModifier,
    ArmorType,
    Asset,
    AssetRole,
    AssetType,
    DamageDie,
    DamageType,
    ShopCatalogItem,
    ShopItemType,
    ShopPrice,
    TokenRole,
    WeaponAmmoType
} from '@/types';
import { canConfigureTokenLightRadius } from '@/lib/assetConfig';
import { v4 as uuidv4 } from 'uuid';

interface ConfigAssetsViewProps {
    onNavigate: (view: 'HOME') => void;
}

const TABS: AssetType[] = ['map', 'token', 'asset', 'audio'];
const DAMAGE_DICE: DamageDie[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
const DAMAGE_TYPES: DamageType[] = ['bludgeoning', 'slashing', 'piercing'];
const AMMO_TYPES: WeaponAmmoType[] = ['arrow', 'bolt', 'projectile', 'bullet'];
const ABILITIES: AbilityModifier[] = ['str', 'dex', 'int', 'wis', 'cha', 'con'];
const ARMOR_TYPES: ArmorType[] = ['light', 'medium', 'heavy', 'shield'];
const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
    bludgeoning: 'Contundente',
    slashing: 'Cortante',
    piercing: 'Perforante'
};
const AMMO_TYPE_LABELS: Record<WeaponAmmoType, string> = {
    arrow: 'Flecha',
    bolt: 'Virote',
    projectile: 'Proyectil',
    bullet: 'Bala'
};
const ABILITY_LABELS: Record<AbilityModifier, string> = {
    str: 'Fue',
    dex: 'Des',
    int: 'Int',
    wis: 'Sab',
    cha: 'Car',
    con: 'Con'
};
const ARMOR_TYPE_LABELS: Record<ArmorType, string> = {
    light: 'Ligera',
    medium: 'Media',
    heavy: 'Pesada',
    shield: 'Escudo'
};
const SHOP_ITEM_TYPE_LABELS: Record<ShopItemType, string> = {
    weapon: 'Arma',
    armor: 'Armadura',
    object: 'Objeto'
};

const createEmptyPrice = (): ShopPrice => ({ cp: 0, sp: 0, gp: 0, pp: 0 });

const createShopItem = (type: ShopItemType): ShopCatalogItem => {
    if (type === 'weapon') {
        return {
            id: uuidv4(),
            type: 'weapon',
            name: 'Nueva arma',
            damageDiceCount: 1,
            damageDie: 'd6',
            damageType: 'slashing',
            properties: {},
            price: createEmptyPrice(),
            quantityAvailable: 1
        };
    }
    if (type === 'armor') {
        return {
            id: uuidv4(),
            type: 'armor',
            name: 'Nueva armadura',
            armorType: 'light',
            armorClass: 10,
            stealth: 'none',
            price: createEmptyPrice(),
            quantityAvailable: 1
        };
    }
    return {
        id: uuidv4(),
        type: 'object',
        name: 'Nuevo objeto',
        description: '',
        price: createEmptyPrice(),
        quantityAvailable: 1
    };
};

export const ConfigAssetsView = ({ onNavigate }: ConfigAssetsViewProps) => {
    const [tab, setTab] = useState<AssetType>('map');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [selectedShopItemId, setSelectedShopItemId] = useState<string | null>(null);
    const [selectedShopType, setSelectedShopType] = useState<ShopItemType>('weapon');
    const { assets, addAsset, updateAsset } = useAssets(tab);
    const { assets: imageAssets } = useAssets(['map', 'token', 'asset']);
    const selectedAsset = useMemo<Asset | null>(() => {
        if (!selectedAssetId) return null;
        return assets.find(asset => asset.id === selectedAssetId) ?? null;
    }, [assets, selectedAssetId]);
    const tokenRole = (selectedAsset?.tokenRole ?? 'enemy') as TokenRole;
    const assetRole = (selectedAsset?.assetRole ?? 'common') as AssetRole;
    const canUseLightRadius = canConfigureTokenLightRadius(tokenRole);
    const mapKind = selectedAsset?.mapKind ?? 'common';
    const shopCatalog = selectedAsset?.shopCatalog ?? [];
    const filteredShopCatalog = shopCatalog.filter((item) => item.type === selectedShopType);
    const selectedShopItem = useMemo<ShopCatalogItem | null>(() => {
        if (!selectedShopItemId) return null;
        return shopCatalog.find((item) => item.id === selectedShopItemId) ?? null;
    }, [selectedShopItemId, shopCatalog]);

    const updateSelectedAsset = (updates: Partial<Asset>) => {
        if (!selectedAsset) return;
        updateAsset(selectedAsset.id, updates);
    };

    const updateShopCatalog = (nextCatalog: ShopCatalogItem[]) => {
        if (!selectedAsset || selectedAsset.type !== 'map') return;
        updateSelectedAsset({ shopCatalog: nextCatalog });
    };

    const updateShopItem = (itemId: string, updater: (item: ShopCatalogItem) => ShopCatalogItem) => {
        updateShopCatalog(shopCatalog.map((item) => item.id === itemId ? updater(item) : item));
    };

    const addCatalogItem = (type: ShopItemType) => {
        const newItem = createShopItem(type);
        updateShopCatalog([...shopCatalog, newItem]);
        setSelectedShopType(type);
        setSelectedShopItemId(newItem.id);
    };

    const removeCatalogItem = (itemId: string) => {
        const nextCatalog = shopCatalog.filter((item) => item.id !== itemId);
        updateShopCatalog(nextCatalog);
        if (selectedShopItemId === itemId) {
            setSelectedShopItemId(nextCatalog[0]?.id ?? null);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-fantasy-bg p-6">
            <div className="h-full grid grid-cols-12 gap-4">
                <GlassPanel className="col-span-4 h-full p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="secondary" onClick={() => onNavigate('HOME')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h2 className="font-cinzel text-fantasy-gold text-xl">Config Assets</h2>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {TABS.map(item => (
                            <Button
                                key={item}
                                variant={tab === item ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => {
                                    setTab(item);
                                    setSelectedAssetId(null);
                                    setSelectedShopItemId(null);
                                }}
                            >
                                {item}
                            </Button>
                        ))}
                    </div>
                    <label className="mb-4 border-2 border-dashed border-fantasy-muted/30 rounded-lg p-4 cursor-pointer hover:border-fantasy-accent/50">
                        <div className="flex items-center justify-center gap-2 text-fantasy-muted">
                            <Upload className="w-4 h-4" />
                            Upload
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept={tab === 'audio' ? 'audio/*' : 'image/*'}
                            onChange={(event) => {
                                if (!event.target.files?.[0]) return;
                                addAsset(event.target.files[0], tab);
                                event.target.value = '';
                            }}
                        />
                    </label>
                    <div className="overflow-y-auto space-y-2">
                        {assets.map(asset => (
                            <button
                                key={asset.id}
                                className={`w-full text-left p-2 rounded-lg border ${selectedAssetId === asset.id ? 'border-fantasy-gold bg-fantasy-accent/10' : 'border-white/10 bg-black/20'}`}
                                onClick={() => setSelectedAssetId(asset.id)}
                            >
                                <p className="text-sm text-fantasy-text truncate">{asset.name}</p>
                                <p className="text-xs text-fantasy-muted">{asset.type}</p>
                            </button>
                        ))}
                    </div>
                </GlassPanel>
                <GlassPanel className="col-span-8 h-full p-6 overflow-y-auto">
                    {!selectedAsset && (
                        <div className="h-full flex items-center justify-center text-fantasy-muted">
                            Select an asset to configure
                        </div>
                    )}
                    {selectedAsset && (
                        <div className="space-y-4">
                            <h3 className="font-cinzel text-2xl text-fantasy-gold">{selectedAsset.name}</h3>
                            {selectedAsset.type === 'map' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-fantasy-muted">
                                        Tipo de mapa
                                        <select
                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                            value={mapKind}
                                            onChange={(event) => {
                                                const nextKind = event.target.value as 'common' | 'shop';
                                                updateSelectedAsset({
                                                    mapKind: nextKind,
                                                    shopCatalog: nextKind === 'shop' ? (selectedAsset.shopCatalog ?? []) : []
                                                });
                                                if (nextKind !== 'shop') {
                                                    setSelectedShopItemId(null);
                                                }
                                            }}
                                        >
                                            <option value="common">Común</option>
                                            <option value="shop">Tienda</option>
                                        </select>
                                    </label>
                                    {mapKind === 'shop' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                                    Si una armadura Ligera, Media o Pesada se lleva sin maestria, se tiene desventaja en tiradas de Fuerza o Destreza con D20 y no se pueden lanzar conjuros.
                                                </p>
                                                <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                                    El bonificador de escudo solo se aplica si existe entrenamiento con escudos.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => addCatalogItem('weapon')}>Añadir arma</Button>
                                                <Button size="sm" variant="secondary" onClick={() => addCatalogItem('armor')}>Añadir armadura</Button>
                                                <Button size="sm" variant="secondary" onClick={() => addCatalogItem('object')}>Añadir objeto</Button>
                                            </div>
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-4 space-y-2 max-h-[55vh] overflow-y-auto pr-2">
                                                    <div className="grid grid-cols-3 gap-1 pb-1">
                                                        <Button
                                                            size="sm"
                                                            variant={selectedShopType === 'weapon' ? 'primary' : 'secondary'}
                                                            onClick={() => {
                                                                setSelectedShopType('weapon');
                                                                setSelectedShopItemId(shopCatalog.find((item) => item.type === 'weapon')?.id ?? null);
                                                            }}
                                                        >
                                                            Armas
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={selectedShopType === 'armor' ? 'primary' : 'secondary'}
                                                            onClick={() => {
                                                                setSelectedShopType('armor');
                                                                setSelectedShopItemId(shopCatalog.find((item) => item.type === 'armor')?.id ?? null);
                                                            }}
                                                        >
                                                            Armaduras
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={selectedShopType === 'object' ? 'primary' : 'secondary'}
                                                            onClick={() => {
                                                                setSelectedShopType('object');
                                                                setSelectedShopItemId(shopCatalog.find((item) => item.type === 'object')?.id ?? null);
                                                            }}
                                                        >
                                                            Objetos
                                                        </Button>
                                                    </div>
                                                    {filteredShopCatalog.length === 0 && (
                                                        <p className="text-xs text-fantasy-muted border border-white/10 rounded-lg p-2">No hay objetos configurados en la tienda.</p>
                                                    )}
                                                    {filteredShopCatalog.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            className={`w-full text-left p-2 rounded-lg border ${selectedShopItemId === item.id ? 'border-fantasy-gold bg-fantasy-accent/10' : 'border-white/10 bg-black/20'}`}
                                                            onClick={() => setSelectedShopItemId(item.id)}
                                                        >
                                                            <p className="text-sm text-fantasy-text truncate">{item.name}</p>
                                                            <p className="text-xs text-fantasy-muted uppercase">{SHOP_ITEM_TYPE_LABELS[item.type]}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="col-span-8 space-y-3">
                                                    {!selectedShopItem && (
                                                        <div className="text-sm text-fantasy-muted border border-white/10 rounded-lg p-3">
                                                            Selecciona un objeto para editar.
                                                        </div>
                                                    )}
                                                    {selectedShopItem && (
                                                        <div className="space-y-3 border border-white/10 rounded-lg p-3 bg-black/20">
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="font-cinzel text-fantasy-gold text-lg capitalize">{SHOP_ITEM_TYPE_LABELS[selectedShopItem.type]}</h4>
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    onClick={() => removeCatalogItem(selectedShopItem.id)}
                                                                >
                                                                    Eliminar
                                                                </Button>
                                                            </div>
                                                            <label className="block text-sm text-fantasy-muted">
                                                                Nombre
                                                                <input
                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                    value={selectedShopItem.name}
                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({ ...item, name: event.target.value }))}
                                                                />
                                                            </label>
                                                            <label className="block text-sm text-fantasy-muted">
                                                                Imagen
                                                                <select
                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                    value={selectedShopItem.imageAssetId ?? ''}
                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                        ...item,
                                                                        imageAssetId: event.target.value || undefined
                                                                    }))}
                                                                >
                                                                    <option value="">Ninguna</option>
                                                                    {imageAssets.map((assetOption) => (
                                                                        <option key={assetOption.id} value={assetOption.id}>{assetOption.name}</option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                            {selectedShopItem.type === 'weapon' && (
                                                                <div className="space-y-3">
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <label className="block text-sm text-fantasy-muted">
                                                                            Numero de dados
                                                                            <input
                                                                                type="number"
                                                                                min={1}
                                                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                value={selectedShopItem.damageDiceCount}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    damageDiceCount: Math.max(1, Number(event.target.value))
                                                                                } : item)}
                                                                            />
                                                                        </label>
                                                                        <label className="block text-sm text-fantasy-muted">
                                                                            Dado de dano
                                                                            <select
                                                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                value={selectedShopItem.damageDie}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    damageDie: event.target.value as DamageDie
                                                                                } : item)}
                                                                            >
                                                                                {DAMAGE_DICE.map((die) => <option key={die} value={die}>{die.toUpperCase()}</option>)}
                                                                            </select>
                                                                        </label>
                                                                        <label className="block text-sm text-fantasy-muted">
                                                                            Tipo de dano
                                                                            <select
                                                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                value={selectedShopItem.damageType}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    damageType: event.target.value as DamageType
                                                                                } : item)}
                                                                            >
                                                                                {DAMAGE_TYPES.map((typeOption) => <option key={typeOption} value={typeOption}>{DAMAGE_TYPE_LABELS[typeOption]}</option>)}
                                                                            </select>
                                                                        </label>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.light)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, light: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            Ligera
                                                                        </label>
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.finesse)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, finesse: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            Sutil
                                                                        </label>
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.twoHanded)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, twoHanded: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            A dos manos
                                                                        </label>
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.reload)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, reload: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            Recarga
                                                                        </label>
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.longRange)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, longRange: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            Gran alcance
                                                                        </label>
                                                                        <label className="block text-xs text-fantasy-muted">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mr-2"
                                                                                checked={Boolean(selectedShopItem.properties.heavy)}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? {
                                                                                    ...item,
                                                                                    properties: { ...item.properties, heavy: event.target.checked }
                                                                                } : item)}
                                                                            />
                                                                            Pesada
                                                                        </label>
                                                                    </div>
                                                                    <label className="block text-xs text-fantasy-muted">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            checked={Boolean(selectedShopItem.properties.versatile?.enabled)}
                                                                            onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                ...item,
                                                                                properties: {
                                                                                    ...item.properties,
                                                                                    versatile: event.target.checked ? {
                                                                                        enabled: true,
                                                                                        twoHandedDamageDie: item.properties.versatile?.twoHandedDamageDie ?? 'd8'
                                                                                    } : undefined
                                                                                }
                                                                            }) : item)}
                                                                        />
                                                                        Versatil
                                                                    </label>
                                                                    {selectedShopItem.properties.versatile?.enabled && (
                                                                        <label className="block text-sm text-fantasy-muted">
                                                                            Dano versatil
                                                                            <select
                                                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                value={selectedShopItem.properties.versatile.twoHandedDamageDie}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                    ...item,
                                                                                    properties: {
                                                                                        ...item.properties,
                                                                                        versatile: {
                                                                                            enabled: true,
                                                                                            twoHandedDamageDie: event.target.value as DamageDie
                                                                                        }
                                                                                    }
                                                                                }) : item)}
                                                                            >
                                                                                {DAMAGE_DICE.map((die) => <option key={die} value={die}>{die.toUpperCase()}</option>)}
                                                                            </select>
                                                                        </label>
                                                                    )}
                                                                    <label className="block text-xs text-fantasy-muted">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            checked={Boolean(selectedShopItem.properties.thrown?.enabled)}
                                                                            onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                ...item,
                                                                                properties: {
                                                                                    ...item.properties,
                                                                                    thrown: event.target.checked ? {
                                                                                        enabled: true,
                                                                                        minRange: item.properties.thrown?.minRange ?? 20,
                                                                                        maxRange: item.properties.thrown?.maxRange ?? 60
                                                                                    } : undefined
                                                                                }
                                                                            }) : item)}
                                                                        />
                                                                        Arrojadiza
                                                                    </label>
                                                                    {selectedShopItem.properties.thrown?.enabled && (
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Alcance minimo
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.properties.thrown.minRange}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                        ...item,
                                                                                        properties: {
                                                                                            ...item.properties,
                                                                                            thrown: {
                                                                                                enabled: true,
                                                                                                minRange: Number(event.target.value),
                                                                                                maxRange: item.properties.thrown?.maxRange ?? 60
                                                                                            }
                                                                                        }
                                                                                    }) : item)}
                                                                                />
                                                                            </label>
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Alcance maximo
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.properties.thrown.maxRange}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                        ...item,
                                                                                        properties: {
                                                                                            ...item.properties,
                                                                                            thrown: {
                                                                                                enabled: true,
                                                                                                minRange: item.properties.thrown?.minRange ?? 20,
                                                                                                maxRange: Number(event.target.value)
                                                                                            }
                                                                                        }
                                                                                    }) : item)}
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                    <label className="block text-xs text-fantasy-muted">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2"
                                                                            checked={Boolean(selectedShopItem.properties.ammunition?.enabled)}
                                                                            onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                ...item,
                                                                                properties: {
                                                                                    ...item.properties,
                                                                                    ammunition: event.target.checked ? {
                                                                                        enabled: true,
                                                                                        minRange: item.properties.ammunition?.minRange ?? 80,
                                                                                        maxRange: item.properties.ammunition?.maxRange ?? 320,
                                                                                        ammoType: item.properties.ammunition?.ammoType ?? 'arrow'
                                                                                    } : undefined
                                                                                }
                                                                            }) : item)}
                                                                        />
                                                                        Municion
                                                                    </label>
                                                                    {selectedShopItem.properties.ammunition?.enabled && (
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Min
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.properties.ammunition.minRange}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                        ...item,
                                                                                        properties: {
                                                                                            ...item.properties,
                                                                                            ammunition: {
                                                                                                enabled: true,
                                                                                                minRange: Number(event.target.value),
                                                                                                maxRange: item.properties.ammunition?.maxRange ?? 320,
                                                                                                ammoType: item.properties.ammunition?.ammoType ?? 'arrow'
                                                                                            }
                                                                                        }
                                                                                    }) : item)}
                                                                                />
                                                                            </label>
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Max
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.properties.ammunition.maxRange}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                        ...item,
                                                                                        properties: {
                                                                                            ...item.properties,
                                                                                            ammunition: {
                                                                                                enabled: true,
                                                                                                minRange: item.properties.ammunition?.minRange ?? 80,
                                                                                                maxRange: Number(event.target.value),
                                                                                                ammoType: item.properties.ammunition?.ammoType ?? 'arrow'
                                                                                            }
                                                                                        }
                                                                                    }) : item)}
                                                                                />
                                                                            </label>
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Tipo de municion
                                                                                <select
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.properties.ammunition.ammoType}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'weapon' ? ({
                                                                                        ...item,
                                                                                        properties: {
                                                                                            ...item.properties,
                                                                                            ammunition: {
                                                                                                enabled: true,
                                                                                                minRange: item.properties.ammunition?.minRange ?? 80,
                                                                                                maxRange: item.properties.ammunition?.maxRange ?? 320,
                                                                                                ammoType: event.target.value as WeaponAmmoType
                                                                                            }
                                                                                        }
                                                                                    }) : item)}
                                                                                >
                                                                                    {AMMO_TYPES.map((ammoType) => <option key={ammoType} value={ammoType}>{AMMO_TYPE_LABELS[ammoType]}</option>)}
                                                                                </select>
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {selectedShopItem.type === 'armor' && (
                                                                <div className="space-y-3">
                                                                    <label className="block text-sm text-fantasy-muted">
                                                                        Tipo de armadura
                                                                        <select
                                                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                            value={selectedShopItem.armorType}
                                                                            onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                ...item,
                                                                                armorType: event.target.value as ArmorType
                                                                            } : item)}
                                                                        >
                                                                            {ARMOR_TYPES.map((armorType) => <option key={armorType} value={armorType}>{ARMOR_TYPE_LABELS[armorType]}</option>)}
                                                                        </select>
                                                                    </label>
                                                                    {selectedShopItem.armorType !== 'shield' && (
                                                                        <>
                                                                            <div className="grid grid-cols-3 gap-2">
                                                                                <label className="block text-sm text-fantasy-muted">
                                                                                    AC
                                                                                    <input
                                                                                        type="number"
                                                                                        min={0}
                                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                        value={selectedShopItem.armorClass}
                                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                            ...item,
                                                                                            armorClass: Number(event.target.value)
                                                                                        } : item)}
                                                                                    />
                                                                                </label>
                                                                                <label className="block text-sm text-fantasy-muted">
                                                                                    Modificador
                                                                                    <select
                                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                        value={selectedShopItem.armorClassModifier?.ability ?? ''}
                                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                            ...item,
                                                                                            armorClassModifier: event.target.value ? {
                                                                                                ability: event.target.value as AbilityModifier,
                                                                                                maxBonus: item.armorClassModifier?.maxBonus
                                                                                            } : undefined
                                                                                        } : item)}
                                                                                    >
                                                                                        <option value="">Ninguno</option>
                                                                                        {ABILITIES.map((ability) => <option key={ability} value={ability}>{ABILITY_LABELS[ability]}</option>)}
                                                                                    </select>
                                                                                </label>
                                                                                <label className="block text-sm text-fantasy-muted">
                                                                                    Max mod
                                                                                    <input
                                                                                        type="number"
                                                                                        min={0}
                                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                        value={selectedShopItem.armorClassModifier?.maxBonus ?? ''}
                                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                            ...item,
                                                                                            armorClassModifier: item.armorClassModifier ? {
                                                                                                ...item.armorClassModifier,
                                                                                                maxBonus: event.target.value === '' ? undefined : Number(event.target.value)
                                                                                            } : item.armorClassModifier
                                                                                        } : item)}
                                                                                    />
                                                                                </label>
                                                                            </div>
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Fuerza requerida
                                                                                <input
                                                                                    type="number"
                                                                                    min={0}
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.requiredStrength ?? ''}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                        ...item,
                                                                                        requiredStrength: event.target.value === '' ? undefined : Number(event.target.value)
                                                                                    } : item)}
                                                                                />
                                                                            </label>
                                                                            <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                                                                Si la Fuerza es menor al requisito, la velocidad se reduce 10 pies (3 metros).
                                                                            </p>
                                                                            <label className="block text-sm text-fantasy-muted">
                                                                                Sigilo
                                                                                <select
                                                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                    value={selectedShopItem.stealth}
                                                                                    onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                        ...item,
                                                                                        stealth: event.target.value as 'none' | 'disadvantage'
                                                                                    } : item)}
                                                                                >
                                                                                    <option value="none">Nada</option>
                                                                                    <option value="disadvantage">Desventaja</option>
                                                                                </select>
                                                                            </label>
                                                                            <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                                                                Desventaja en sigilo aplica desventaja a tiradas de Destreza (Sigilo).
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                    {selectedShopItem.armorType === 'shield' && (
                                                                        <label className="block text-sm text-fantasy-muted">
                                                                            AC
                                                                            <input
                                                                                type="number"
                                                                                min={0}
                                                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                                value={selectedShopItem.armorClass}
                                                                                onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'armor' ? {
                                                                                    ...item,
                                                                                    armorClass: Number(event.target.value)
                                                                                } : item)}
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {selectedShopItem.type === 'object' && (
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    Descripcion
                                                                    <textarea
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2 min-h-24"
                                                                        value={selectedShopItem.description}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => item.type === 'object' ? {
                                                                            ...item,
                                                                            description: event.target.value
                                                                        } : item)}
                                                                    />
                                                                </label>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    Peso (Kg)
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        step="0.1"
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.weightKg ?? ''}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            weightKg: event.target.value === '' ? undefined : Number(event.target.value)
                                                                        }))}
                                                                    />
                                                                </label>
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    Cantidad
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.quantityAvailable}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            quantityAvailable: Math.max(0, Number(event.target.value))
                                                                        }))}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    CP
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.price.cp}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            price: { ...item.price, cp: Math.max(0, Number(event.target.value)) }
                                                                        }))}
                                                                    />
                                                                </label>
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    SP
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.price.sp}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            price: { ...item.price, sp: Math.max(0, Number(event.target.value)) }
                                                                        }))}
                                                                    />
                                                                </label>
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    GP
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.price.gp}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            price: { ...item.price, gp: Math.max(0, Number(event.target.value)) }
                                                                        }))}
                                                                    />
                                                                </label>
                                                                <label className="block text-sm text-fantasy-muted">
                                                                    PP
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                                        value={selectedShopItem.price.pp}
                                                                        onChange={(event) => updateShopItem(selectedShopItem.id, (item) => ({
                                                                            ...item,
                                                                            price: { ...item.price, pp: Math.max(0, Number(event.target.value)) }
                                                                        }))}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {selectedAsset.type === 'token' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-fantasy-muted">
                                        Token Type
                                        <select
                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                            value={tokenRole}
                                            onChange={(event) => {
                                                updateAsset(selectedAsset.id, { tokenRole: event.target.value as TokenRole });
                                            }}
                                        >
                                            <option value="enemy">Enemy</option>
                                            <option value="player">Player</option>
                                            <option value="npc">NPC</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </label>
                                    {(tokenRole === 'player') && (
                                        <>
                                            <label className="block text-sm text-fantasy-muted">
                                                Name
                                                <input
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.name ?? ''}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: event.target.value,
                                                                className: selectedAsset.playerConfig?.className ?? '',
                                                                level: selectedAsset.playerConfig?.level ?? 1
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                            <label className="block text-sm text-fantasy-muted">
                                                Class
                                                <input
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.className ?? ''}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: selectedAsset.playerConfig?.name ?? '',
                                                                className: event.target.value,
                                                                level: selectedAsset.playerConfig?.level ?? 1
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                            <label className="block text-sm text-fantasy-muted">
                                                Level
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.level ?? 1}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: selectedAsset.playerConfig?.name ?? '',
                                                                className: selectedAsset.playerConfig?.className ?? '',
                                                                level: Number(event.target.value)
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </>
                                    )}
                                    {canUseLightRadius && (
                                        <label className="block text-sm text-fantasy-muted">
                                            Light Radius (% map)
                                            <input
                                                type="number"
                                                min={0}
                                                max={40}
                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                value={selectedAsset.lightRadius ?? 0}
                                                onChange={(event) => {
                                                    updateAsset(selectedAsset.id, { lightRadius: Number(event.target.value) });
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                            {selectedAsset.type === 'asset' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-fantasy-muted">
                                        Asset Type
                                        <select
                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                            value={assetRole}
                                            onChange={(event) => {
                                                updateAsset(selectedAsset.id, { assetRole: event.target.value as AssetRole });
                                            }}
                                        >
                                            <option value="common">Common</option>
                                            <option value="light_source">Light source</option>
                                        </select>
                                    </label>
                                    {assetRole === 'light_source' && (
                                        <label className="block text-sm text-fantasy-muted">
                                            Light Radius (% map)
                                            <input
                                                type="number"
                                                min={0}
                                                max={40}
                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                value={selectedAsset.lightRadius ?? 10}
                                                onChange={(event) => {
                                                    updateAsset(selectedAsset.id, { lightRadius: Number(event.target.value) });
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </GlassPanel>
            </div>
        </div>
    );
};
