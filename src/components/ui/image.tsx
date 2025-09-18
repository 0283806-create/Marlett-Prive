import React from 'react';
import Image from 'next/image';

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: string;
}

export function CustomImage({
  src,
  alt,
  width = 200,
  height = 200,
  className = '',
  priority = false,
  fallback
}: CustomImageProps) {
  const [error, setError] = React.useState(false);

  if (error && fallback) {
    return (
      <div 
        className={`bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-stone-600 text-sm">{alt}</span>
      </div>
    );
  }

  if (src.endsWith('.svg')) {
    return (
      <div className={className} style={{ width, height }}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
