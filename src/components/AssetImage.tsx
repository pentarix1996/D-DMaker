import { useEffect, useState } from 'react';
import { db } from '@/db';


export const AssetImage = ({ id, className, ...props }: { id: string; className?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string;

        const load = async () => {
            const asset = await db.assets.get(id);
            if (asset && asset.fileData) {
                objectUrl = URL.createObjectURL(asset.fileData);
                setSrc(objectUrl);
            }
        };

        if (id) load();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [id]);

    if (!src) return <div className={`bg-white/5 animate-pulse ${className}`} />;

    return <img src={src} className={className} {...props} />;
};
