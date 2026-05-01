import { useEffect, useState } from 'react';
import { db } from '@/db';

interface AssetMediaProps {
  id: string;
  className?: string;
}

export const AssetMedia = ({ id, className, ...props }: AssetMediaProps & React.ImgHTMLAttributes<HTMLImageElement> & React.VideoHTMLAttributes<HTMLVideoElement>) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    let url: string;

    const load = async () => {
      const asset = await db.assets.get(id);
      if (asset && asset.fileData) {
        url = URL.createObjectURL(asset.fileData);
        setObjectUrl(url);
        // Also check if filename extension suggests video when type is missing
        const isVideoType = asset.fileData.type.startsWith('video/');
        const isVideoName = asset.name.match(/\.(mp4|webm|ogg|mov)$/i);
        setIsVideo(isVideoType || !!isVideoName);
      }
    };

    if (id) load();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (!objectUrl) return <div className={`bg-white/5 animate-pulse ${className}`} />;

  if (isVideo) {
    const videoProps = props as React.VideoHTMLAttributes<HTMLVideoElement>;
    return (
      <video
        src={objectUrl}
        autoPlay
        playsInline
        controls
        loop={videoProps.loop ?? true}
        className={className}
        {...videoProps}
      />
    );
  }

  return <img src={objectUrl} className={className} {...props} />;
};
