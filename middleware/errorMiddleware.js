// middlewares/errorMiddleware.js
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
