# START HERE - Pornire Modul Prezentări

## PROBLEMĂ ACTUALĂ
Eroarea "Failed to fetch" la login înseamnă că backend-ul Django nu rulează sau nu e accesibil.

## SOLUȚIE - Pași exacti:

### 1. INSTALEAZĂ DEPENDENȚE BACKEND
```bash
# În terminal, folder principal (unde e manage.py)
pip install channels daphne
```

### 2. CREEAZĂ ȘI APLICĂ MIGRĂRI
```bash
# Generează migrări pentru modelele noi
python manage.py makemigrations api

# Aplică migrările
python manage.py migrate
```

**IMPORTANT:** Vei vedea migrări pentru:
- BrandKit
- Asset
- PresentationTemplate
- Presentation
- PresentationAccess
- Frame
- FrameConnection
- Element
- Comment
- PresentationVersion
- Recording

### 3. PORNEȘTE BACKEND
```bash
# Opțiunea 1: Cu WebSocket support (RECOMANDAT)
daphne -b 0.0.0.0 -p 8000 smarthack2025.asgi:application

# SAU Opțiunea 2: Clasic (fără WebSocket live)
python manage.py runserver
```

**Backend va rula pe:** `http://localhost:8000`

### 4. VERIFICĂ BACKEND FUNCȚIONEAZĂ
Deschide în browser:
- `http://localhost:8000/api/hello/` - ar trebui să vezi mesaj JSON
- `http://localhost:8000/admin/` - admin panel

### 5. PORNEȘTE FRONTEND
```bash
# În alt terminal
cd frontend
npm run dev
```

**Frontend va rula pe:** `http://localhost:3000`

### 6. TESTEAZĂ
1. Mergi la `http://localhost:3000/login`
2. Dacă nu ai user, creează unul:
   ```bash
   python manage.py createsuperuser
   ```
3. Login cu user-ul
4. Mergi la `http://localhost:3000/presentations`
5. Click "Prezentare nouă"

---

## DACĂ TOT NU MERGE

### Fix CORS (dacă vezi erori CORS în console)
Verifică în `smarthack2025/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Verifică baza de date
```bash
# Verifică că MySQL rulează și ai acces
mysql -u django_user -p
# password: django_pass

# În MySQL console:
USE smarthack2025;
SHOW TABLES;
```

### Verifică că Channels e instalat corect
```bash
python -c "import channels; print(channels.__version__)"
python -c "import daphne; print(daphne.__version__)"
```

---

## QUICK TEST DUPĂ PORNIRE

### Test 1: Backend API
```bash
curl http://localhost:8000/api/hello/
# Răspuns așteptat: {"message": "Merge apiu baieti"}
```

### Test 2: Prezentări API (după login)
```bash
# Obține token la login, apoi:
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/presentations/presentations/
# Răspuns: [] (listă goală initial)
```

### Test 3: Frontend
- Login: `http://localhost:3000/login`
- Prezentări: `http://localhost:3000/presentations`
- Click "Prezentare nouă" → ar trebui redirect la editor

---

## STRUCTURĂ COMPLETĂ ENDPOINTS

După ce pornești tot, ai acces la:

### Prezentări
- `GET /api/presentations/presentations/` - listă
- `POST /api/presentations/presentations/` - creare
- `GET /api/presentations/presentations/{id}/`
- `PATCH /api/presentations/presentations/{id}/`
- `DELETE /api/presentations/presentations/{id}/`

### Frames
- `GET /api/presentations/frames/?presentation_id={id}`
- `POST /api/presentations/frames/`
- `PATCH /api/presentations/frames/{id}/`

### Elements
- `GET /api/presentations/elements/?frame_id={id}`
- `POST /api/presentations/elements/`
- `PATCH /api/presentations/elements/{id}/`

### AI
- `POST /api/presentations/ai/generate/`
- `POST /api/presentations/ai/rewrite/`
- `POST /api/presentations/ai/suggest-visuals/`

### WebSocket
- `ws://localhost:8000/ws/presentations/{id}/`

---

**Rulează comenzile de mai sus în ordine și ar trebui să meargă tot!**
