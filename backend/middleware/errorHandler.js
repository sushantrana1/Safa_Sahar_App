const errorHandler = (err, req, res, next) => {
  // ===== DEBUG BLOCK — remove after fixing =====
  console.error("\n========== RAW ERROR ==========");
  console.error("Type:", typeof err);
  console.error("Constructor:", err?.constructor?.name);
  console.error("Keys:", Object.keys(err || {}));
  console.error("Message:", err?.message);
  console.error("Code:", err?.code);
  console.error("HTTP Code:", err?.http_code);
  console.error("Stack:", err?.stack);
  console.error("Full object:", JSON.stringify(err, Object.getOwnPropertyNames(err || {}), 2));
  console.error("===============================\n");
  // =============================================

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err?.message || "Server Error";

  // Multer errors (file too large, wrong type, etc.)
  if (err?.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Image is too large. Maximum size is 5MB.";
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file field.";
  }

  // Cloudinary errors (often come as plain objects with http_code)
  if (err?.http_code) {
    statusCode = err.http_code >= 400 && err.http_code < 500 ? 400 : 500;
    message = err.message || "Cloudinary upload failed";
  }

  // Mongoose bad ObjectId
  if (err?.name === "CastError" && err?.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err?.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "Field";
    message = `${field} already exists`;
  }

  // Mongoose validation
  if (err?.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ");
  }

  // JWT errors
  if (err?.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  console.error(`[FINAL] ${statusCode} · ${message}`);

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err?.stack,
      raw: err?.message === undefined ? err : undefined,
    }),
  });
};

module.exports = errorHandler;