import React, { useState } from 'react';

interface MediaMessageProps {
  type: 'image' | 'video' | 'gif' | 'file';
  mediaUrl: string;
  content?: string;
  filename?: string;
  size?: number;
  mimeType?: string;
}

const MediaMessage: React.FC<MediaMessageProps> = ({
  type,
  mediaUrl,
  content,
  filename,
  size,
  mimeType
}) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderMedia = () => {
    switch (type) {
      case 'image':
      case 'gif':
        return (
          <div style={{ position: 'relative' }}>
            {content && (
              <div style={{ 
                fontSize: '14px',
                marginBottom: '8px',
                color: '#666'
              }}>
                {content}
              </div>
            )}
            {!imageError ? (
              <img 
                src={mediaUrl}
                alt={filename || 'Bild'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
                onClick={() => window.open(mediaUrl, '_blank')}
                onError={() => setImageError(true)}
                onLoad={(e) => {
                  // Zeige Ladeanimation bis Bild geladen ist
                  (e.target as HTMLImageElement).style.opacity = '1';
                }}
                onLoadStart={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.5';
                }}
              />
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                <div>Bild konnte nicht geladen werden</div>
                {filename && <div style={{ fontSize: '12px' }}>{filename}</div>}
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div>
            {content && (
              <div style={{ 
                fontSize: '14px',
                marginBottom: '8px',
                color: '#666'
              }}>
                {content}
              </div>
            )}
            {!videoError ? (
              <video 
                controls
                preload="metadata"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5'
                }}
                onError={() => setVideoError(true)}
              >
                <source src={mediaUrl} type={mimeType || 'video/mp4'} />
                Dein Browser unterstützt das Video-Element nicht.
              </video>
            ) : (
              <div style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#666'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎥</div>
                <div>Video konnte nicht geladen werden</div>
                {filename && <div style={{ fontSize: '12px' }}>{filename}</div>}
              </div>
            )}
          </div>
        );

      case 'file':
      default:
        return (
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onClick={() => window.open(mediaUrl, '_blank')}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#e9ecef';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = '#f8f9fa';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#007AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                📎
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  {filename || 'Datei'}
                </div>
                {size && (
                  <div style={{ 
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {formatFileSize(size)}
                  </div>
                )}
              </div>
              <div style={{ color: '#007AFF', fontSize: '12px' }}>
                📥 Öffnen
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {renderMedia()}
    </div>
  );
};

export default MediaMessage;
