# Smarthack 2025 - Interactive Learning Platform

O platformă educațională modernă care combină prezentări interactive tip Prezi cu jocuri de tip Kahoot pentru o experiență de învățare captivantă și interactivă.

## 📋 Cuprins

- [Descriere Generală](#-descriere-generală)
- [Tehnologii Utilizate](#-tehnologii-utilizate)
- [Arhitectura Proiectului](#-arhitectura-proiectului)
- [Funcționalități Principale](#-funcționalități-principale)
- [Structura Bazei de Date](#-structura-bazei-de-date)
- [API Endpoints](#-api-endpoints)
- [WebSocket Routes](#-websocket-routes)
- [Instalare și Configurare](#-instalare-și-configurare)
- [Deployment](#-deployment)
- [Pagini Frontend](#-pagini-frontend)
- [Componente Principale](#-componente-principale)

## 🎯 Descriere Generală

**Smarthack2025** este o platformă full-stack care oferă profesorilor și studenților două module principale:

1. **Modul de Prezentări Interactive**: Un editor de prezentări modern cu canvas infinit, navigare non-liniară între slide-uri, colaborare în timp real și funcționalități AI pentru generare automată de conținut.

2. **Modul de Quiz-uri Interactive**: Un sistem de jocuri educaționale în timp real (similar cu Kahoot) unde profesorii pot crea quiz-uri, iar studenții pot participa folosind un PIN unic, cu sistem de punctaj, streak-uri și clasament live.

## 🚀 Tehnologii Utilizate

### Backend
- **Django 5.2.8** - Framework web principal
- **Django REST Framework** - API RESTful
- **Django Channels** - WebSocket support pentru comunicare în timp real
- **Daphne** - ASGI server pentru Channels
- **MySQL 8.0** - Bază de date relațională
- **mysql-connector-python** - Driver MySQL pentru Python
- **Anthropic Claude API** - Integrare AI pentru generare de conținut
- **python-pptx** - Export prezentări în format PowerPoint
- **ReportLab & Pillow** - Export prezentări în format PDF

### Frontend
- **Next.js 16.0.1** - Framework React cu server-side rendering
- **React 19.2.0** - Library UI
- **TypeScript 5** - Tipizare statică
- **Tailwind CSS 4** - Framework CSS utility-first
- **Framer Motion 12.23** - Animații și tranziții
- **Lucide React** - Set de iconuri
- **QRCode** - Generare coduri QR pentru acces rapid
- **SweetAlert2** - Modale și notificări elegante

### DevOps & Infrastructure
- **Docker & Docker Compose** - Containerizare
- **phpMyAdmin** - Interfață de administrare MySQL

## 🏗 Arhitectura Proiectului

```
Smarthack2025/
├── smarthack2025/          # Configurare Django principală
│   ├── settings.py         # Setări aplicație (DB, middleware, CORS)
│   ├── urls.py             # URL routing principal
│   ├── asgi.py             # ASGI config pentru WebSockets
│   └── wsgi.py             # WSGI config pentru deployment
│
├── api/                    # Modul de prezentări
│   ├── models.py           # Modele DB (Presentation, Frame, Element, etc.)
│   ├── views.py            # Views pentru autentificare
│   ├── presentation_views.py   # Views pentru prezentări
│   ├── management_views.py     # Views pentru management utilizatori
│   ├── serializers.py      # Serializare date REST
│   ├── presentation_serializers.py
│   ├── consumers.py        # WebSocket consumers pentru colaborare
│   ├── routing.py          # WebSocket routing
│   ├── urls.py             # URL patterns API
│   ├── presentation_urls.py
│   ├── ai_service.py       # Servicii AI (Claude)
│   ├── export_service.py   # Export PDF/PPTX
│   ├── permissions.py      # Permisiuni custom
│   ├── auth_backends.py    # Autentificare email/username
│   └── constants.py        # Constante aplicație
│
├── game_module/            # Modul de quiz-uri interactive
│   ├── models.py           # Game, GameSession, Question, Choice, Player
│   ├── views.py            # API views pentru jocuri
│   ├── serializers.py      # Serializare date jocuri
│   ├── consumers.py        # WebSocket pentru jocuri live
│   ├── routing.py          # WebSocket routing jocuri
│   ├── urls.py             # URL patterns jocuri
│   └── middleware.py       # Middleware custom
│
├── frontend/               # Aplicație Next.js
│   ├── app/                # Pages și routing (App Router)
│   │   ├── page.tsx        # Homepage
│   │   ├── login/          # Autentificare
│   │   ├── register/       # Înregistrare
│   │   ├── dashboard/      # Dashboard profesor
│   │   ├── presentations/  # Prezentări
│   │   │   ├── page.tsx    # Lista prezentări
│   │   │   └── [id]/       # Prezentare specifică
│   │   │       ├── edit/   # Editor prezentare
│   │   │       ├── view/   # Vizualizare
│   │   │       └── present/# Mod prezentare
│   │   └── game/           # Jocuri
│   │       ├── page.tsx    # Lista jocuri
│   │       ├── host/       # Creare joc
│   │       ├── join/       # Alăturare joc
│   │       ├── lobby/[pin]/    # Lobby joc
│   │       ├── host-control/[pin]/  # Control host
│   │       └── play/[pin]/ # Interfață player
│   │
│   └── components/         # Componente React reutilizabile
│       ├── canvas/         # Componente canvas prezentări
│       ├── presentations/  # Componente prezentări
│       └── game/           # Componente jocuri
│
├── docker-compose.yml      # Configurare Docker
├── Dockerfile              # Docker image
├── requirements.txt        # Dependențe Python
├── package.json            # Dependențe Node.js
└── manage.py               # Django management script
```

## ✨ Funcționalități Principale

### 🎨 Modul Prezentări Interactive

#### 1. Editor Canvas cu Navigare Non-liniară
- Canvas infinit cu zoom și pan
- Drag & drop pentru elemente
- Navigare liberă între frame-uri (slide-uri)
- Conexiuni personalizate între frame-uri pentru povești ramificate

#### 2. Tipuri de Elemente Suportate
- **Text**: Text formatat cu stiluri custom
- **Image**: Imagini cu suport pentru redimensionare
- **Shape**: Forme geometrice (dreptunghiuri, cercuri, etc.)
- **Video**: Embedding video
- **Chart**: Grafice și diagrame
- **Code**: Bloc de cod cu syntax highlighting
- **Embed**: Conținut embedded (iframes)

#### 3. Funcționalități AI
- **Generare Automată**: Creare prezentări complete din prompt text
- **Rewrite Text**: Reformulare text existent
- **Suggest Visuals**: Sugestii pentru imagini și grafice
- **Slide Advice**: Recomandări pentru îmbunătățirea slide-urilor

#### 4. Colaborare în Timp Real
- Multiple cursoare pentru colaboratori
- Editare simultană
- Sistem de comentarii pe elemente și frame-uri
- Notificări live pentru modificări

#### 5. Brand Kit & Assets
- Gestiune culori, fonturi și logo-uri corporative
- Bibliotecă de assets (imagini, video, icoane)
- Template-uri reutilizabile

#### 6. Versionare & Istoric
- Salvare automată
- Versiuni multiple ale prezentărilor
- Rollback la versiuni anterioare

#### 7. Export & Partajare
- Export PDF cu layout păstrat
- Export PowerPoint (.pptx)
- Link-uri de partajare cu token unic
- Control granular al permisiunilor (view/edit/comment)

#### 8. Înregistrări
- Înregistrare prezentări live
- Salvare și partajare recording-uri

### 🎮 Modul Quiz-uri Interactive (Game Module)

#### 1. Tipuri de Întrebări
- **Multiple Choice**: Întrebări cu variante multiple
- **True/False**: Întrebări adevărat/fals
- **Puzzle/Order**: Aranjare în ordine corectă
- **Type Answer**: Răspuns scris (exact match)
- **Open-Ended**: Întrebări deschise

#### 2. Sistem de Joc
- **PIN Unic**: Fiecare sesiune de joc primește un PIN de 6 cifre
- **Lobby**: Așteptare participanți cu afișare în timp real
- **Timer Personalizabil**: Limită de timp per întrebare (configurabilă)
- **Media Support**: Imagini și video în întrebări

#### 3. Sistem de Punctaj
- **Punctaj Bazat pe Viteză**: Mai multe puncte pentru răspunsuri rapide
- **Streak System**: Bonusuri pentru răspunsuri consecutive corecte
- **Punctaj de Bază**: Configurabil per joc (default: 1000)
- **Formula**: `punctaj = base_points × (time_remaining / time_limit) × streak_multiplier`

#### 4. Flow-ul Jocului
1. **Lobby**: Profesorul creează sesiunea, elevii se alătură cu PIN
2. **Running**: Profesorul lansează întrebări secvenţial
3. **Score Display**: Afișare clasament după fiecare întrebare
4. **Finished**: Clasament final și statistici

#### 5. Interfețe Separate
- **Host Control**: Interfață profesor pentru control joc
  - Start/stop întrebări
  - Vizualizare răspunsuri în timp real
  - Control flow joc
- **Player Interface**: Interfață elev simplificată
  - Vizualizare întrebare
  - Răspuns rapid
  - Afișare scor personal

#### 6. WebSocket Real-time
- Sincronizare instantanee între toate dispozitivele
- Actualizări live clasament
- Notificări pentru noi întrebări
- Feedback instant pentru răspunsuri

#### 7. Generare AI Quiz
- Generare automată întrebări din material didactic
- Scor automat pentru întrebări deschise folosind Claude AI
- Diversificare tipuri de întrebări

## 🗄 Structura Bazei de Date

### Modul Prezentări

#### BrandKit
```sql
- id: BigAutoField (PK)
- name: CharField(255)
- created_at, updated_at: DateTimeField
- colors, fonts, logos: TextField (JSON)
- is_default: IntegerField
- created_by_id: FK(User)
- group_id: FK(Group, nullable)
```

#### Asset
```sql
- id: BigAutoField (PK)
- name: CharField(255)
- asset_type: CharField(20) [image, video, icon]
- file_url: CharField(500)
- thumbnail_url: CharField(500)
- tags: TextField (JSON)
- file_size: IntegerField
- created_at: DateTimeField
- uploaded_by_id: FK(User)
- group_id: FK(Group, nullable)
```

#### PresentationTemplate
```sql
- id: BigAutoField (PK)
- name: CharField(255)
- description: TextField
- category: CharField(50)
- thumbnail_url: CharField(500)
- structure: TextField (JSON)
- is_public: IntegerField
- created_at: DateTimeField
- created_by_id: FK(User)
```

#### Presentation
```sql
- id: BigAutoField (PK)
- title: CharField(255)
- description: TextField
- canvas_settings: TextField (JSON)
- presentation_path: TextField (JSON)
- thumbnail_url: CharField(500)
- share_token: CharField(64, unique)
- is_public: IntegerField
- created_at, updated_at: DateTimeField
- owner_id: FK(User)
- brand_kit_id: FK(BrandKit, nullable)
- template_id: FK(PresentationTemplate, nullable)
- group_id: FK(Group, nullable)
```

#### PresentationAccess
```sql
- id: BigAutoField (PK)
- permission: CharField(20) [view, edit, comment, admin]
- granted_at: DateTimeField
- presentation_id: FK(Presentation)
- user_id: FK(User)
- granted_by_id: FK(User, nullable)
```

#### Frame
```sql
- id: BigAutoField (PK)
- title: CharField(255)
- position: TextField (JSON) {x, y, scale}
- background_color: CharField(20)
- background_image: CharField(500)
- order: IntegerField
- thumbnail_url: CharField(500)
- transition_settings: TextField (JSON)
- created_at, updated_at: DateTimeField
- presentation_id: FK(Presentation)
```

#### FrameConnection
```sql
- id: BigAutoField (PK)
- label: CharField(100)
- from_frame_id: FK(Frame)
- to_frame_id: FK(Frame)
- UNIQUE(from_frame_id, to_frame_id)
```

#### Element
```sql
- id: BigAutoField (PK)
- element_type: CharField(20) [text, image, shape, video, chart, code, embed]
- position: TextField (JSON) {x, y, width, height, rotation, z_index}
- content: TextField (JSON) - specific fiecărui tip
- animation_settings: TextField (JSON)
- link_url: CharField(500)
- created_at, updated_at: DateTimeField
- frame_id: FK(Frame)
```

#### Comment
```sql
- id: BigAutoField (PK)
- text: TextField
- position: TextField (JSON) {x, y}
- is_resolved: IntegerField
- created_at, updated_at: DateTimeField
- author_id: FK(User)
- presentation_id: FK(Presentation)
- frame_id: FK(Frame, nullable)
- element_id: FK(Element, nullable)
```

#### PresentationVersion
```sql
- id: BigAutoField (PK)
- version_number: IntegerField
- snapshot: TextField (JSON)
- notes: TextField
- created_at: DateTimeField
- created_by_id: FK(User)
- presentation_id: FK(Presentation)
```

#### Recording
```sql
- id: BigAutoField (PK)
- title: CharField(255)
- recording_url: CharField(500)
- duration: IntegerField (seconds)
- share_token: CharField(64)
- created_at: DateTimeField
- created_by_id: FK(User)
- presentation_id: FK(Presentation)
```

#### CollaborationSession
```sql
- id: BigAutoField (PK)
- cursor_position: TextField (JSON) {x, y}
- selected_element_id: CharField(36, nullable)
- color: CharField(7) - culoare cursor
- channel_name: CharField(255)
- joined_at, last_seen: DateTimeField
- presentation_id: FK(Presentation)
- user_id: FK(User)
```

### Modul Management Studenți

#### StudentGroup
```sql
- id: BigAutoField (PK)
- slug: SlugField(64, unique)
- name: CharField(255)
- description: TextField
- created_at, updated_at: DateTimeField
```

#### Student
```sql
- id: BigAutoField (PK)
- first_name: CharField(150)
- last_name: CharField(150)
- email: EmailField
- group_id: FK(StudentGroup)
- user_id: FK(User, nullable, unique)
- created_at, updated_at: DateTimeField
```

### Modul Jocuri

#### Game
```sql
- id: BigAutoField (PK)
- title: CharField(255)
- description: TextField
- host_id: FK(User)
- base_points: IntegerField (default: 1000)
- created_at: DateTimeField
```

#### GameSession
```sql
- id: BigAutoField (PK)
- game_id: FK(Game)
- host_id: FK(User, nullable)
- pin: CharField(6, unique) - generat automat
- status: CharField(15) [lobby, running, score_display, finished]
- current_question_id: FK(Question, nullable)
- created_at: DateTimeField
```

#### Question
```sql
- id: BigAutoField (PK)
- game_id: FK(Game)
- text: TextField
- type: CharField(20) [choice, true_false, puzzle, type_answer, open_ended]
- time_limit: IntegerField (default: 20)
- order: IntegerField
- media_url: URLField (nullable)
```

#### Choice
```sql
- id: BigAutoField (PK)
- question_id: FK(Question)
- text: CharField(400)
- is_correct: BooleanField
- order: IntegerField
```

#### Player
```sql
- id: BigAutoField (PK)
- session_id: FK(GameSession)
- user_id: FK(User, nullable)
- nickname: CharField(100)
- score: IntegerField (default: 0)
- streak: IntegerField (default: 0)
- joined_at: DateTimeField
```

#### Answer
```sql
- id: BigAutoField (PK)
- player_id: FK(Player)
- question_id: FK(Question)
- choice_id: FK(Choice, nullable)
- submitted_answer_text: TextField (nullable)
- time_taken: FloatField (nullable)
- points_awarded: IntegerField
- answered_at: DateTimeField
```

## 🔌 API Endpoints

### Autentificare & Utilizatori

```
POST   /api/register/              - Înregistrare utilizator nou
POST   /api/login/                 - Autentificare (email sau username)
POST   /api/logout/                - Deconectare
GET    /api/user/                  - Informații utilizator curent
GET    /api/roles/                 - Lista roluri disponibile
GET    /api/hello/                 - Health check endpoint
```

### Management Utilizatori & Studenți

```
# Utilizatori
GET    /api/management/users/                    - Lista utilizatori
POST   /api/management/users/                    - Creare utilizator
GET    /api/management/users/{id}/               - Detalii utilizator
PUT    /api/management/users/{id}/               - Actualizare utilizator
DELETE /api/management/users/{id}/               - Ștergere utilizator

# Grupuri Studenți
GET    /api/management/student-groups/           - Lista grupuri
POST   /api/management/student-groups/           - Creare grup
GET    /api/management/student-groups/{id}/      - Detalii grup
PUT    /api/management/student-groups/{id}/      - Actualizare grup
DELETE /api/management/student-groups/{id}/      - Ștergere grup

# Studenți
GET    /api/management/students/                 - Lista studenți
POST   /api/management/students/                 - Creare student
GET    /api/management/students/{id}/            - Detalii student
PUT    /api/management/students/{id}/            - Actualizare student
DELETE /api/management/students/{id}/            - Ștergere student
```

### Prezentări - CRUD Principal

```
# Brand Kits
GET    /api/brand-kits/            - Lista brand kits
POST   /api/brand-kits/            - Creare brand kit
GET    /api/brand-kits/{id}/       - Detalii brand kit
PUT    /api/brand-kits/{id}/       - Actualizare brand kit
DELETE /api/brand-kits/{id}/       - Ștergere brand kit

# Assets
GET    /api/assets/                - Lista assets
POST   /api/assets/                - Upload asset
GET    /api/assets/{id}/           - Detalii asset
PUT    /api/assets/{id}/           - Actualizare asset
DELETE /api/assets/{id}/           - Ștergere asset

# Templates
GET    /api/templates/             - Lista template-uri
POST   /api/templates/             - Creare template
GET    /api/templates/{id}/        - Detalii template
PUT    /api/templates/{id}/        - Actualizare template
DELETE /api/templates/{id}/        - Ștergere template

# Presentations
GET    /api/presentations/         - Lista prezentări
POST   /api/presentations/         - Creare prezentare
GET    /api/presentations/{id}/    - Detalii prezentare
PUT    /api/presentations/{id}/    - Actualizare prezentare
DELETE /api/presentations/{id}/    - Ștergere prezentare

# Access Control
GET    /api/access/                - Lista permisiuni
POST   /api/access/                - Grant permisiune
GET    /api/access/{id}/           - Detalii permisiune
PUT    /api/access/{id}/           - Actualizare permisiune
DELETE /api/access/{id}/           - Revoke permisiune

# Frames
GET    /api/frames/                - Lista frame-uri
POST   /api/frames/                - Creare frame
GET    /api/frames/{id}/           - Detalii frame
PUT    /api/frames/{id}/           - Actualizare frame
DELETE /api/frames/{id}/           - Ștergere frame

# Frame Connections
GET    /api/frame-connections/     - Lista conexiuni
POST   /api/frame-connections/     - Creare conexiune
GET    /api/frame-connections/{id}/ - Detalii conexiune
PUT    /api/frame-connections/{id}/ - Actualizare conexiune
DELETE /api/frame-connections/{id}/ - Ștergere conexiune

# Elements
GET    /api/elements/              - Lista elemente
POST   /api/elements/              - Creare element
GET    /api/elements/{id}/         - Detalii element
PUT    /api/elements/{id}/         - Actualizare element
DELETE /api/elements/{id}/         - Ștergere element

# Comments
GET    /api/comments/              - Lista comentarii
POST   /api/comments/              - Creare comentariu
GET    /api/comments/{id}/         - Detalii comentariu
PUT    /api/comments/{id}/         - Actualizare comentariu
DELETE /api/comments/{id}/         - Ștergere comentariu

# Recordings
GET    /api/recordings/            - Lista înregistrări
POST   /api/recordings/            - Creare înregistrare
GET    /api/recordings/{id}/       - Detalii înregistrare
PUT    /api/recordings/{id}/       - Actualizare înregistrare
DELETE /api/recordings/{id}/       - Ștergere înregistrare
```

### Prezentări - AI Features

```
POST   /api/ai/generate/           - Generare outline prezentare din prompt
POST   /api/ai/generate-full/      - Generare prezentare completă
POST   /api/ai/rewrite/            - Reformulare text
POST   /api/ai/suggest-visuals/    - Sugestii vizuale
POST   /api/ai/slide-advice/       - Sfaturi îmbunătățire slide
```

**Request Body Example** (`/api/ai/generate-full/`):
```json
{
  "prompt": "Crează o prezentare despre sistemul solar pentru clasa a 5-a",
  "num_slides": 8,
  "brand_kit_id": 1
}
```

### Prezentări - Export

```
GET    /api/presentations/{id}/export/pdf/   - Export PDF
GET    /api/presentations/{id}/export/pptx/  - Export PowerPoint
```

### Jocuri Interactive

```
# Games CRUD
GET    /api/games/                 - Lista jocuri
POST   /api/games/                 - Creare joc
GET    /api/games/{id}/            - Detalii joc
PUT    /api/games/{id}/            - Actualizare joc
DELETE /api/games/{id}/            - Ștergere joc

# Game Sessions
GET    /api/games/sessions/        - Lista sesiuni
POST   /api/games/sessions/        - Creare sesiune (generează PIN)
GET    /api/games/sessions/{id}/   - Detalii sesiune
PUT    /api/games/sessions/{id}/   - Actualizare sesiune
DELETE /api/games/sessions/{id}/   - Ștergere sesiune

# Game Actions
POST   /api/games/{id}/start/      - Start sesiune joc
POST   /api/games/{id}/join/       - Alăturare la joc (cu PIN)
POST   /api/games/{id}/answer/     - Trimitere răspuns
GET    /api/games/{id}/leaderboard/ - Clasament joc
POST   /api/games/{id}/next-question/ - Următoarea întrebare (host)
POST   /api/games/{id}/end/        - Finalizare joc

# Statistics
GET    /api/games/session-leaderboard/  - Clasament sesiune
GET    /api/games/session-results/      - Rezultate detaliate sesiune
```

## 🔄 WebSocket Routes

### Prezentări - Colaborare în Timp Real

```
ws://localhost:8000/ws/presentations/{presentation_id}/
```

**Mesaje Suportate**:
```javascript
// Client → Server
{
  "type": "cursor_move",
  "data": {"x": 100, "y": 200}
}

{
  "type": "element_update",
  "data": {"element_id": 123, "position": {...}}
}

{
  "type": "frame_update",
  "data": {"frame_id": 456, "title": "New Title"}
}

{
  "type": "comment_add",
  "data": {"frame_id": 456, "text": "Great slide!", "position": {...}}
}

// Server → Client
{
  "type": "user_joined",
  "user": {"id": 1, "username": "john", "color": "#FF5733"}
}

{
  "type": "cursor_update",
  "user_id": 1,
  "position": {"x": 100, "y": 200}
}

{
  "type": "element_updated",
  "element": {...}
}
```

### Jocuri - Real-time Game Flow

```
ws://localhost:8000/ws/game/{pin}/
```

**Mesaje Suportate**:
```javascript
// Host → Server
{
  "type": "start_game"
}

{
  "type": "next_question",
  "question_id": 123
}

{
  "type": "show_leaderboard"
}

{
  "type": "end_game"
}

// Player → Server
{
  "type": "join_game",
  "nickname": "John Doe"
}

{
  "type": "submit_answer",
  "question_id": 123,
  "choice_id": 456,
  "time_taken": 3.5
}

// Server → All Clients
{
  "type": "player_joined",
  "player": {"id": 1, "nickname": "John Doe"}
}

{
  "type": "question_started",
  "question": {
    "id": 123,
    "text": "What is 2+2?",
    "type": "choice",
    "time_limit": 20,
    "choices": [...]
  }
}

{
  "type": "answer_submitted",
  "player_id": 1,
  "is_correct": true
}

{
  "type": "leaderboard_update",
  "leaderboard": [
    {"player_id": 1, "nickname": "John", "score": 950, "streak": 3},
    ...
  ]
}

{
  "type": "game_finished",
  "final_leaderboard": [...]
}
```

## 📦 Instalare și Configurare

### Prerequisite

- Python 3.11+
- Node.js 20+ & npm
- MySQL 8.0
- Docker & Docker Compose (opțional)

### Setup cu Docker (Recomandat)

1. **Clonează repository-ul**
```bash
git clone https://github.com/your-username/smarthack2025.git
cd smarthack2025
```

2. **Configurează variabilele de mediu**
```bash
# Creează .env în root
cp .env.example .env

# Editează .env cu configurațiile tale
ANTHROPIC_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

3. **Start servicii Docker**
```bash
docker-compose up -d
```

Aceasta va porni:
- MySQL server pe `localhost:3306`
- phpMyAdmin pe `localhost:8080`

4. **Setup Backend**
```bash
# Instalează dependențe Python
pip install -r requirements.txt

# Rulează migrări
python manage.py migrate

# Creează superuser
python manage.py createsuperuser

# Pornește serverul Django
daphne -b 0.0.0.0 -p 8000 smarthack2025.asgi:application
```

5. **Setup Frontend**
```bash
cd frontend

# Instalează dependențe Node.js
npm install

# Pornește dev server
npm run dev
```

Frontend va fi disponibil pe `http://localhost:3000`
Backend va fi disponibil pe `http://localhost:8000`

### Setup Manual (fără Docker)

1. **Instalează MySQL 8.0**

2. **Creează baza de date**
```sql
CREATE DATABASE smarthack2025;
CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'django_pass';
GRANT ALL PRIVILEGES ON smarthack2025.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configurează [settings.py](smarthack2025/settings.py:107-116)**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smarthack2025',
        'USER': 'django_user',
        'PASSWORD': 'django_pass',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

4. **Urmează pașii 4-5 din secțiunea Docker**

### Configurări Importante

#### [settings.py](smarthack2025/settings.py)

```python
# Securitate
DEBUG = False  # True în development
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-domain.com']

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",
]

# AI
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')

# Channels
ASGI_APPLICATION = 'smarthack2025.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}
```

## 🚀 Deployment

### Backend Deployment

1. **Configurare producție în [settings.py](smarthack2025/settings.py)**
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECRET_KEY = os.environ.get('SECRET_KEY')
```

2. **Collect static files**
```bash
python manage.py collectstatic --noinput
```

3. **Deployment cu Gunicorn + Daphne**
```bash
# Pentru HTTP requests
gunicorn smarthack2025.wsgi:application --bind 0.0.0.0:8000

# Pentru WebSocket (separat)
daphne -b 0.0.0.0 -p 8001 smarthack2025.asgi:application
```

4. **Configurare Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # HTTP requests
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files
    location /static/ {
        alias /path/to/staticfiles/;
    }
}
```

### Frontend Deployment

```bash
cd frontend

# Build pentru producție
npm run build

# Start production server
npm start
```

Sau deploy pe Vercel:
```bash
vercel deploy --prod
```

Verifică [DEPLOYMENT.md](DEPLOYMENT.md) pentru detalii complete.

## 🖥 Pagini Frontend

### Publice
- **[/](frontend/app/page.tsx)** - Homepage cu landing page
- **[/login](frontend/app/login/page.tsx)** - Autentificare
- **[/register](frontend/app/register/page.tsx)** - Înregistrare utilizator nou
- **[/forget](frontend/app/forget/page.tsx)** - Recuperare parolă

### Prezentări
- **[/presentations](frontend/app/presentations/page.tsx)** - Lista tuturor prezentărilor
- **[/presentations/[id]](frontend/app/presentations/[id]/page.tsx)** - Detalii prezentare
- **[/presentations/[id]/edit](frontend/app/presentations/[id]/edit/page.tsx)** - Editor canvas complet
- **[/presentations/[id]/view](frontend/app/presentations/[id]/view/page.tsx)** - Vizualizare read-only
- **[/presentations/[id]/present](frontend/app/presentations/[id]/present/page.tsx)** - Mod prezentare (fullscreen)

### Jocuri
- **[/game](frontend/app/game/page.tsx)** - Lista jocuri proprii
- **[/game/host](frontend/app/game/host/page.tsx)** - Creare joc nou
- **[/game/join](frontend/app/game/join/page.tsx)** - Alăturare la joc cu PIN
- **[/game/lobby/[pin]](frontend/app/game/lobby/[pin]/page.tsx)** - Lobby așteptare jucători
- **[/game/host-control/[pin]](frontend/app/game/host-control/[pin]/page.tsx)** - Control panel pentru host
- **[/game/play/[pin]](frontend/app/game/play/[pin]/page.tsx)** - Interfață jucător (răspuns întrebări)

### Dashboard
- **[/dashboard](frontend/app/dashboard/page.tsx)** - Dashboard principal profesor
- **[/dashboard/create](frontend/app/dashboard/create/page.tsx)** - Creare resursă nouă (joc/prezentare)
- **[/dashboard/cursuri/[id]](frontend/app/dashboard/cursuri/[id]/page.tsx)** - Detalii curs specific

### Setări
- **[/settings](frontend/app/settings/page.tsx)** - Setări utilizator

## 🧩 Componente Principale

### Canvas & Editor ([frontend/components/](frontend/components/))

#### Prezentări
- **[CanvasEditor.tsx](frontend/components/presentations/CanvasEditor.tsx)** - Editor principal canvas cu toate funcționalitățile
- **[CanvasRenderer.tsx](frontend/components/canvas/CanvasRenderer.tsx)** - Rendering canvas cu zoom/pan
- **[FrameRenderer.tsx](frontend/components/canvas/FrameRenderer.tsx)** - Rendering frame individual
- **[ElementRenderer.tsx](frontend/components/canvas/ElementRenderer.tsx)** - Rendering element pe canvas
- **[FramesSidebar.tsx](frontend/components/presentations/FramesSidebar.tsx)** - Sidebar cu thumbnail-uri frame-uri
- **[FramesList.tsx](frontend/components/canvas/FramesList.tsx)** - Lista frame-uri cu reordonare
- **[Toolbar.tsx](frontend/components/canvas/Toolbar.tsx)** - Toolbar cu tool-uri editare
- **[PropertiesPanel.tsx](frontend/components/canvas/PropertiesPanel.tsx)** - Panel proprietăți element selectat
- **[ElementInspector.tsx](frontend/components/presentations/ElementInspector.tsx)** - Inspector detaliat pentru elemente
- **[FrameInspector.tsx](frontend/components/presentations/FrameInspector.tsx)** - Inspector detaliat pentru frame-uri

#### AI & Assets
- **[AIPanel.tsx](frontend/components/presentations/AIPanel.tsx)** - Panel funcționalități AI
- **[AIGenerateDialog.tsx](frontend/components/presentations/AIGenerateDialog.tsx)** - Dialog generare AI
- **[AssetsPanel.tsx](frontend/components/presentations/AssetsPanel.tsx)** - Bibliotecă assets

#### Colaborare
- **[CommentsPanel.tsx](frontend/components/presentations/CommentsPanel.tsx)** - Panel comentarii
- **[ShareDialog.tsx](frontend/components/presentations/ShareDialog.tsx)** - Dialog partajare și permisiuni

### Jocuri ([frontend/components/game/](frontend/components/game/))

#### Host
- **[HostLobbyView.tsx](frontend/components/game/HostLobbyView.tsx)** - Vizualizare lobby pentru host
- **[HostQuestionView.tsx](frontend/components/game/HostQuestionView.tsx)** - Vizualizare întrebare pentru host (cu răspunsuri live)
- **[QuestionEditor.tsx](frontend/components/game/QuestionEditor.tsx)** - Editor creare/editare întrebări

#### Player
- **[Lobby.tsx](frontend/components/game/Lobby.tsx)** - Lobby pentru jucători
- **[QuestionView.tsx](frontend/components/game/QuestionView.tsx)** - Vizualizare întrebare pentru jucător
- **[Scoreboard.tsx](frontend/components/game/Scoreboard.tsx)** - Clasament live

## 🎨 Design System

### Culori Tailwind
Proiectul folosește Tailwind CSS 4 cu un design modern și accesibil:
- Primary: Blue shades
- Success: Green shades
- Warning: Yellow/Orange shades
- Danger: Red shades

### Animații
- **Framer Motion** pentru tranziții fluide între frame-uri
- Animații cursor colaboratori în timp real
- Tranziții smooth pentru modificări UI

### Iconuri
- **Lucide React** - set modern de iconuri SVG

## 🔐 Autentificare & Permisiuni

### Tipuri de Utilizatori
1. **Admin** - Acces complet la toate funcționalitățile
2. **Teacher/Professor** - Poate crea prezentări, jocuri, gestiona studenți
3. **Student** - Poate participa la jocuri, vizualiza prezentări partajate

### Sistem Permisiuni Prezentări
- **admin** - Control complet (owner)
- **edit** - Poate edita prezentarea
- **comment** - Poate adăuga comentarii
- **view** - Doar vizualizare

### Authentication Backend Custom
[auth_backends.py](api/auth_backends.py) - Permite autentificare cu email SAU username

## 🧪 Testing

```bash
# Backend tests
python manage.py test api
python manage.py test game_module

# Frontend tests (dacă configurate)
cd frontend
npm test
```

## 📊 Statistici & Analytics

### Jocuri
- Timp mediu de răspuns per întrebare
- Acuratețe per tip de întrebare
- Progres elevi în timp
- Comparație performanță între sesiuni

### Prezentări
- Număr vizualizări
- Timp petrecut per frame
- Engagement rate
- Export statistics

## 🐛 Debugging

Verifică [DEBUGGING.md](DEBUGGING.md) pentru:
- Common issues și soluții
- Logs și monitoring
- Performance optimization tips

## 🤝 Contribuții

1. Fork repository-ul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## 📄 Licență

Acest proiect este dezvoltat pentru SmartHack 2025.