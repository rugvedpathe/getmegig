// ── Cloudinary upload utility ──────────────────────────────────────
// Set these two env vars in Vercel (and in .env.local locally):
//   REACT_APP_CLOUDINARY_CLOUD_NAME    → your cloud name from cloudinary.com/console
//   REACT_APP_CLOUDINARY_UPLOAD_PRESET → your unsigned preset name
//
// How to create a free Cloudinary account + preset:
//   1. Sign up at cloudinary.com (free tier: 25 GB storage, 25 GB bandwidth/mo)
//   2. Dashboard → Settings → Upload → "Add upload preset"
//   3. Set Signing Mode = "Unsigned", note the preset name
//   4. Copy your Cloud Name from the dashboard top-left

const CLOUD_NAME    = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME    || '';
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '';

export function isCloudinaryConfigured() {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export async function uploadToCloudinary(file, onProgress) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary env vars not set. See cloudinary.js for instructions.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const isVideo      = file.type.startsWith('video/');
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
          url:       data.secure_url,
          publicId:  data.public_id,
          type:      isVideo ? 'video' : 'image',
          thumbnail: isVideo
            ? data.secure_url.replace('/upload/', '/upload/w_600,h_400,c_fill,so_2/')
            : data.secure_url,
        });
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.open('POST', url);
    xhr.send(formData);
  });
}
