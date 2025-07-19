const API_BASE_URL = window.location.origin;
// Avatar URL Utility Functions
// Verwende relative URLs statt localhost
// Diese Datei ist bereits korrekt, keine Änderung nötig.

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