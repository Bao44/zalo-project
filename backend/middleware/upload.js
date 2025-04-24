const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ tạm thời cho multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        console.log("File:", file); // In ra thông tin tệp
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Lọc loại tệp (hỗ trợ hình ảnh, âm thanh, video, và các tệp khác)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/heic",
        "audio/mpeg",
        "audio/m4a",
        "video/mp4",
        "text/csv",
        'application/pdf', // PDF
        'application/msword', // Word (.doc)
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
        'application/vnd.ms-excel', // Excel (.xls)
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
        'application/vnd.ms-project', // Microsoft Project (.mpp)
        'application/vnd.ms-powerpoint', // PowerPoint (.ppt)
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint (.pptx)
        'application/vnd.ms-outlook', // Outlook (.msg)
        'application/rtf', // Rich Text Format (.rtf)
        'application/vnd.oasis.opendocument.text', // Open Document Text (.odt)
        'application/vnd.oasis.opendocument.spreadsheet', // Open Document Spreadsheet (.ods)
        'application/vnd.oasis.opendocument.presentation', // Open Document Presentation (.odp)
        'application/zip', // ZIP (.zip)
        'application/x-rar-compressed', // RAR (.rar)
        'application/vnd.rar', // RAR (.rar)
        'text/plain', // File văn bản (.txt)
        'text/comma-separated-values', // CSV (.csv)
        'application/vnd.android.package-archive', // APK (.apk)
        'java/*', // Java (.java)
        'text/css', // CSS (.css)
        'text/html', // HTML (.html)
        'application/json', // JSON (.json)
        'application/xml', // XML (.xml)
        'text/xml', // XML (.xml
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Loại tệp không được hỗ trợ"), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // Giới hạn kích thước tệp: 50MB
    },
});

// Middleware để xử lý nhiều trường tệp
const uploadMiddleware = upload.fields([
    { name: "attachments", maxCount: 50 }, // Hình ảnh
    { name: "file", maxCount: 5 }, // Tệp
    { name: "media", maxCount: 2 }, // Video hoặc audio
]);

module.exports = uploadMiddleware;