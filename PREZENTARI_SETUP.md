# Modul Prezentări - Setup & Pornire

## 1. INSTALARE DEPENDENȚE BACKEND

```bash
# În folder-ul principal (unde e manage.py)
pip install channels daphne channels-redis
```

**Note:**
- `channels` - pentru WebSocket support
- `daphne` - ASGI server
- `channels-redis` - opțional, pentru producție (în dev folosim InMemory)

## 2. MIGRARE BAZĂ DE DATE

```bash
# Creează migrații pentru modelele noi
python manage.py makemigrations api

# Aplică migrații
python manage.py migrate
```

## 3. PORNIRE BACKEND

**Varianta 1: Development (cu Daphne pentru WebSocket)**
```bash
daphne -b 0.0.0.0 -p 8000 smarthack2025.asgi:application
```

**Varianta 2: Development clasic (fără WebSocket live)**
```bash
python manage.py runserver
```

**IMPORTANT:** Pentru colaborare live (WebSocket), folosește Daphne (varianta 1).

## 4. PORNIRE FRONTEND

```bash
cd frontend
npm install  # dacă nu ai instalat deja
npm run dev
```

Frontend va rula pe `http://localhost:3000`

## 5. ACCES APLICAȚIE

### Pagini principale:
- **Lista prezentări:** `http://localhost:3000/presentations`
- **Editor prezentare:** `http://localhost:3000/presentations/[id]`

### API Endpoints disponibile:

#### Prezentări
- `GET /api/presentations/presentations/` - listă prezentări
- `POST /api/presentations/presentations/` - creare prezentare
- `GET /api/presentations/presentations/{id}/` - detalii prezentare
- `PATCH /api/presentations/presentations/{id}/` - update prezentare
- `DELETE /api/presentations/presentations/{id}/` - ștergere prezentare
- `POST /api/presentations/presentations/{id}/duplicate/` - duplicare
- `POST /api/presentations/presentations/{id}/set_path/` - setare traseu
- `POST /api/presentations/presentations/{id}/generate_share_token/` - share link
- `GET /api/presentations/presentations/by_token/?token=...` - acces prin token

#### Frames
- `GET /api/presentations/frames/?presentation_id={id}` - frames per prezentare
- `POST /api/presentations/frames/` - creare frame
- `PATCH /api/presentations/frames/{id}/` - update frame
- `DELETE /api/presentations/frames/{id}/` - ștergere frame
- `POST /api/presentations/frames/{id}/duplicate/` - duplicare frame

#### Elements
- `GET /api/presentations/elements/?frame_id={id}` - elemente per frame
- `POST /api/presentations/elements/` - creare element
- `PATCH /api/presentations/elements/{id}/` - update element
- `DELETE /api/presentations/elements/{id}/` - ștergere element

#### Assets
- `GET /api/presentations/assets/` - listă assets
- `POST /api/presentations/assets/` - upload asset
- `GET /api/presentations/assets/search/?q=...&type=...` - căutare assets

#### Brand Kits
- `GET /api/presentations/brand-kits/` - listă brand kits
- `POST /api/presentations/brand-kits/` - creare brand kit
- `PATCH /api/presentations/brand-kits/{id}/` - update

#### Templates
- `GET /api/presentations/templates/` - listă template-uri
- `GET /api/presentations/templates/by_category/?category=PITCH` - filtrare

#### AI
- `POST /api/presentations/ai/generate/` - generare structură prezentare
  ```json
  {
    "title": "Product Launch",
    "purpose": "Pitch investitori",
    "audience": "C-level",
    "duration": 10
  }
  ```

- `POST /api/presentations/ai/rewrite/` - rescriere text
  ```json
  {
    "text": "Text de rescris",
    "mode": "professional"  // professional, casual, shorter, longer
  }
  ```

- `POST /api/presentations/ai/suggest-visuals/` - sugestii imagini
  ```json
  {
    "text": "Text pentru analiză"
  }
  ```

#### Comments
- `GET /api/presentations/comments/?presentation_id={id}` - comentarii
- `POST /api/presentations/comments/` - adaugă comentariu
- `POST /api/presentations/comments/{id}/resolve/` - marchează rezolvat

#### Export
- `POST /api/presentations/presentations/{id}/export/pdf/` - export PDF
- `POST /api/presentations/presentations/{id}/export/images/` - export imagini

#### WebSocket (colaborare)
- `ws://localhost:8000/ws/presentations/{id}/` - colaborare live

**Mesaje WebSocket:**
```json
// Element update
{
  "type": "element_update",
  "element_id": 123,
  "changes": { "position": "..." }
}

// Frame update
{
  "type": "frame_update",
  "frame_id": 456,
  "changes": { "title": "New Title" }
}

// Cursor move (opțional)
{
  "type": "cursor_move",
  "x": 100,
  "y": 200
}
```

## 6. TESTARE RAPIDĂ

### 6.1. Creează un user de test
```bash
python manage.py createsuperuser
```

### 6.2. Login în frontend
- Mergi la `http://localhost:3000/login`
- Autentifică-te cu user-ul creat

### 6.3. Creează prima prezentare
- Mergi la `http://localhost:3000/presentations`
- Click "Prezentare nouă"
- Vei fi redirecționat către editor

### 6.4. Testează editorul
- **Canvas:** click & drag pentru pan, Ctrl+Scroll pentru zoom
- **Adaugă text:** click butonul "Text" din toolbar
- **Adaugă shape:** click Square/Circle din toolbar
- **Frames:** sidebar stânga - adaugă frames noi
- **Assets:** panel dreapta - tab "Assets"
- **AI:** panel dreapta - tab "AI" - testează generare/rewrite
- **Comments:** panel dreapta - tab "Comments"

## 7. CONFIGURARE PRODUCȚIE

### 7.1. Redis pentru Channels (recomandat producție)
```bash
# Instalează Redis
# Windows: https://github.com/microsoftarchive/redis/releases
# Linux: sudo apt install redis-server

# Update settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### 7.2. Storage pentru media (S3/compatibil)
Configurează în `settings.py`:
```python
# AWS S3 sau alt provider
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = 'your-key'
AWS_SECRET_ACCESS_KEY = 'your-secret'
AWS_STORAGE_BUCKET_NAME = 'your-bucket'
```

### 7.3. AI Client integration
În `presentation_views.py`, înlocuiește mock-urile cu apeluri reale:
```python
# Ex: OpenAI
import openai

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_presentation(request):
    # ... validare input

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )

    # Parse răspuns și returnează
```

## 8. STRUCTURA FIȘIERE

```
api/
├── models.py                    # Modele: Presentation, Frame, Element, etc.
├── presentation_serializers.py  # Serializers DRF
├── presentation_views.py        # ViewSets & API endpoints
├── presentation_urls.py         # URL routing pentru prezentări
├── consumers.py                 # WebSocket consumers
└── routing.py                   # WebSocket URL routing

frontend/
├── app/
│   └── presentations/
│       ├── page.tsx            # Lista prezentări
│       └── [id]/
│           └── page.tsx        # Editor prezentare
├── components/presentations/
│   ├── CanvasEditor.tsx        # Canvas principal cu zoom/pan
│   ├── FramesSidebar.tsx       # Sidebar frames
│   ├── AssetsPanel.tsx         # Panel assets
│   ├── AIPanel.tsx             # Panel AI tools
│   ├── CommentsPanel.tsx       # Panel comentarii
│   └── Toolbar.tsx             # Toolbar sus
├── contexts/
│   └── PresentationContext.tsx # State management prezentare
└── hooks/
    └── useWebSocket.ts         # WebSocket hook
```

## 9. FEATURES IMPLEMENTATE

### ✅ Creare & Design
- Canvas neliniar cu zoom/pan
- Frames interconectate
- Grid & positioning
- Drag & drop elements

### ✅ Content & Assets
- Template-uri (structură definită)
- Bibliotecă assets
- Upload media
- Multiple tipuri elemente: TEXT, IMAGE, VIDEO, SHAPE, PDF, GIF

### ✅ Editare
- Text styling (fontSize, fontFamily, color, align)
- Image display cu filters placeholder
- Shapes (rectangle, circle)
- Position, resize, rotate pentru elemente

### ✅ Brand Kit
- Modele la nivel organizație
- Culori, fonturi, logo-uri
- Aplicare pe prezentări

### ✅ AI & Automatizare
- Generate presentation (mock)
- Rewrite text (mock)
- Suggest visuals (mock)
- Endpoint-uri definite - integrare AI_CLIENT externă ușoară

### ✅ Colaborare
- WebSocket real-time sync
- User joined/left notifications
- Element/Frame updates broadcast
- Permisiuni: OWNER/EDITOR/VIEWER

### ✅ Comments
- Comentarii pe prezentare/frame
- Mark as resolved
- Multi-user support

### ✅ Export (placeholder)
- Export JSON pentru offline
- Export PDF (structure defined)
- Export images (structure defined)

## 10. NEXT STEPS (Opțional - Implementare Viitoare)

1. **Video Overlay**
   - Integrare MediaRecorder API
   - Upload video la backend
   - Player cu overlay webcam

2. **PDF Export Real**
   - Integrare WeasyPrint sau ReportLab
   - Generate PDF din frames

3. **Present Mode**
   - Full-screen presentation view
   - Keyboard navigation
   - Traseu custom frames

4. **Advanced Editing**
   - Image crop/filters real (ex: canvas manipulation)
   - Rich text editor (ex: Tiptap)
   - Animation between frames

5. **Templates Reale**
   - Template-uri predefinite populate
   - Aplicare template pe prezentare existentă

## 11. TROUBLESHOOTING

### WebSocket nu se conectează
- Verifică că rulezi cu Daphne, nu `runserver`
- Check URL: `ws://localhost:8000/ws/presentations/{id}/`
- Verifică authentication (token în localStorage)

### Erori la migrare
```bash
# Șterge migrații vechi dacă e nevoie
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc"  -delete

# Recreează
python manage.py makemigrations
python manage.py migrate
```

### Frontend nu găsește componentele
- Verifică că toate fișierele sunt create în locațiile corecte
- Check imports în `page.tsx` files
- Restart dev server

---

**Done!** Ai acum un modul complet de prezentări integrat în aplicația ta.
