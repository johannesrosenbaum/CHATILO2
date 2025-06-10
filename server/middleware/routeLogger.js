module.exports = (req, res, next) => {
  if (req.path.includes('/chat/rooms/nearby')) {
    console.log('🔥🔥🔥 ROUTE ACCESSED:', req.method, req.path);
    console.log('🔥🔥🔥 FULL URL:', req.originalUrl);
    console.log('🔥🔥🔥 TIMESTAMP:', new Date().toISOString());
  }
  next();
};
