"""Tahap pra-pemrosesan citra (OpenCV) sebelum gambar masuk ke model YOLO."""
import cv2
import numpy as np

# Ambang ketajaman. Sama dengan di web (braille-web/src/utils/blur.js):
# gambar diperkecil ke lebar 100 px, lalu varians Laplacian dihitung.
BLUR_MIN = 80
_UKURAN_CEK = 100


def laplacian_variance(img_bgr):
    """Ukur ketajaman gambar. Makin kecil nilainya, makin buram."""
    abu = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = abu.shape
    tinggi = max(3, round(h / w * _UKURAN_CEK))
    kecil = cv2.resize(abu, (_UKURAN_CEK, tinggi), interpolation=cv2.INTER_AREA)
    lap = cv2.Laplacian(kecil, cv2.CV_64F, ksize=1)
    return float(lap[1:-1, 1:-1].var())


def is_blurry(img_bgr, batas=BLUR_MIN):
    nilai = laplacian_variance(img_bgr)
    return nilai < batas, round(nilai)


def apply_clahe(img_bgr, clip_limit=2.0, tile=8):
    """CLAHE pada kanal kecerahan (L) ruang warna LAB.

    Kontras diratakan per kotak kecil, sehingga bayangan dan cahaya tidak rata
    berkurang. Hasilnya tetap gambar 3 kanal agar bisa langsung dipakai YOLO.
    """
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile, tile))
    l2 = clahe.apply(l)
    return cv2.cvtColor(cv2.merge((l2, a, b)), cv2.COLOR_LAB2BGR)
