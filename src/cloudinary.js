// Cloudinary upload utility
// Uses unsigned upload preset - set up your own at cloudinary.com (free)
// Replace CLOUD_NAME and UPLOAD_PRESET with your own values

const CLOUD_NAME = 'getmegig'; // Replace with your Cloudinary cloud name
const UPLOAD_PRESET = 'getmegig_unsigned'; // Replace with your upload preset name

export async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          type: isVideo ? 'video' : 'image',
          thumbnail: isVideo
            ? data.secure_url.replace('/upload/', '/upload/w_400,h_300,c_fill,so_2/')
            : data.secure_url,
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('POST', url);
    xhr.send(formData);
  });
}

export function isCloudinaryConfigured() {
  return CLOUD_NAME !== 'getmegig' || UPLOAD_PRESET !== 'getmegig_unsigned';
  // Returns false until you set up your own Cloudinary account
  // Falls back to base64/localStorage when not configured
}
