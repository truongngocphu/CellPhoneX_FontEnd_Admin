export function extractDriveFileId(url) {
    const regex = /\/d\/([a-zA-Z0-9_-]{25,})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
}
export function extractDriveThumbnailIdAndSz(url) {
    const regex = /id=([^&]+)&sz/;
    const match = url.match(regex);
    return match ? `${match[1]}&sz` : null;
}

export const getIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/id=([^&]+)/);
    return match ? match[1] : null;
};

// Tách ID từ URL kiểu: https://drive.google.com/file/d/<ID>/view...
export const extractDriveId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : null;
};

// Chuyển danh sách URL sang danh sách thumbnail URL
export const convertToThumbnailUrls = (driveUrls) => {
    return driveUrls.map(url => {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : null;
    }).filter(Boolean); // loại bỏ null nếu có
};