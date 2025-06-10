import React from 'react';

interface Image {
    id: string;
    url: string;
    likes: number;
}

interface ImageGalleryProps {
    images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const sortedImages = [...images].sort((a, b) => b.likes - a.likes);

    return (
        <div className="image-gallery">
            {sortedImages.map(image => (
                <div key={image.id} className="image-item">
                    <img src={image.url} alt={`Image ${image.id}`} />
                    <div className="likes">Likes: {image.likes}</div>
                </div>
            ))}
        </div>
    );
};

export default ImageGallery;