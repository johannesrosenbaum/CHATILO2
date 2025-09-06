const API_BASE_URL = window.location.origin;

// Modern Default Avatar Generator - CI Conform
export const generateDefaultAvatar = (username: string | undefined): string => {
  if (!username) return generateAbstractAvatar();
  
  const firstChar = username.charAt(0).toUpperCase();
  const charCode = firstChar.charCodeAt(0);
  
  // CI-konforme Gradienten basierend auf deinem Corporate Design
  const ciGradients = [
    // Haupt-CI Gradient (wie bei Hello. und Chatilo.)
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    // Variationen des CI-Gradients
    'linear-gradient(135deg, #667eea 20%, #764ba2 80%)',
    'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #5a67d8 0%, #764ba2 100%)',
    'linear-gradient(135deg, #667eea 0%, #805ad5 100%)',
    // Subtile Variationen im CI-Spektrum
    'linear-gradient(135deg, #4c51bf 0%, #764ba2 100%)',
    'linear-gradient(135deg, #667eea 0%, #6b46c1 100%)',
    'linear-gradient(135deg, #5b63d3 0%, #764ba2 100%)',
  ];
  
  const gradientIndex = charCode % ciGradients.length;
  const selectedGradient = ciGradients[gradientIndex];
  
  // SVG mit CI-konformen Farben
  const svgContent = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ciGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#667eea" />
          <stop offset="100%" stop-color="#764ba2" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#ciGrad)" />
      <text x="50" y="50" font-family="Poppins, Arial, sans-serif" font-size="36" font-weight="600" 
            text-anchor="middle" dominant-baseline="central" fill="white" opacity="0.95">
        ${firstChar}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

// Abstract geometric avatar - CI Conform
export const generateAbstractAvatar = (): string => {
  const ciPatterns = [
    `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ciGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#667eea" />
          <stop offset="100%" stop-color="#764ba2" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ciGrad1)" />
      <circle cx="30" cy="30" r="15" fill="rgba(255,255,255,0.15)" />
      <circle cx="70" cy="70" r="12" fill="rgba(255,255,255,0.1)" />
      <circle cx="20" cy="80" r="8" fill="rgba(255,255,255,0.08)" />
    </svg>`,
    
    `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ciGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#667eea" />
          <stop offset="100%" stop-color="#764ba2" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#ciGrad2)" />
      <polygon points="50,20 80,80 20,80" fill="rgba(255,255,255,0.12)" />
    </svg>`,
  ];
  
  const randomPattern = ciPatterns[Math.floor(Math.random() * ciPatterns.length)];
  return `data:image/svg+xml;base64,${btoa(randomPattern)}`;
};

// Avatar URL Utility Functions
export const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  // If it's a relative path, construct full URL
  if (avatarPath.startsWith('/')) {
    return `${API_BASE_URL}${avatarPath}`;
  }
  
  // If it's just a filename, construct path
  return `${API_BASE_URL}/uploads/avatars/${avatarPath}`;
};

// Enhanced Avatar component logic
export const getDisplayAvatar = (user: any): string => {
  const avatarUrl = getAvatarUrl(user?.avatar) || user?.profileImage;
  
  if (avatarUrl) {
    return avatarUrl;
  }
  
  // Generate professional default avatar
  return generateDefaultAvatar(user?.username);
};

// Debug function to log avatar URL construction
export const debugAvatarUrl = (avatarPath: string | null | undefined): void => {
  console.log('🔧 Avatar URL Debug:');
  console.log('   Input path:', avatarPath);
  console.log('   Type:', typeof avatarPath);
  console.log('   Final URL:', getAvatarUrl(avatarPath));
};

export const getDisplayName = (user: any): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user?.firstName) {
    return user.firstName;
  }
  if (user?.lastName) {
    return user.lastName;
  }
  return user?.username || 'Unbekannter Benutzer';
}; 