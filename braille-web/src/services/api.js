const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const CLAHE_KEY = 'railuma-clahe';

// Pengaturan "Ratakan cahaya" (CLAHE) disimpan di browser
export const isClaheOn = () => {
  try {
    return localStorage.getItem(CLAHE_KEY) === '1';
  } catch {
    return false;
  }
};

export const translateBrailleImage = async (imageBlob) => {
  const formData = new FormData();
  formData.append('file', imageBlob, 'braille-capture.jpg');

  const query = isClaheOn() ? '?clahe=true' : '';
  const response = await fetch(`${API_URL}/translate/${query}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Gagal menghubungi server FastAPI.');
  }

  return response.json();
};
