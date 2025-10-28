const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export interface UploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

// 서명 생성 함수
export async function generateUploadSignature() {
  try {
    const response = await fetch('/api/cloudinary-signature', {
      method: 'POST',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate signature:', error);
    throw error;
  }
}

// 이미지 업로드 (클라이언트 직접 업로드)
export async function uploadImage(file: File): Promise<UploadResponse> {
  const { signature, timestamp } = await generateUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', CLOUDINARY_API_KEY || '');
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', 'instagram-sns');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary error response:', response.status, errorData);
      throw new Error(`Upload failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return {
      public_id: data.public_id,
      url: data.url,
      secure_url: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// URL에서 이미지 업로드
export async function uploadImageFromUrl(imageUrl: string): Promise<UploadResponse> {
  const { signature, timestamp } = await generateUploadSignature();

  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('api_key', CLOUDINARY_API_KEY || '');
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', 'instagram-sns');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cloudinary error response:', response.status, errorData);
      throw new Error(`Upload failed: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return {
      public_id: data.public_id,
      url: data.url,
      secure_url: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// 이미지 삭제
export async function deleteImage(publicId: string): Promise<void> {
  try {
    const response = await fetch('/api/cloudinary-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

// 이미지 URL 최적화
export function getOptimizedImageUrl(
  publicId: string,
  {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'auto',
  }: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string {
  let transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push(`c_${crop}`);

  const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(
    ','
  )}/${publicId}`;

  return url;
}
