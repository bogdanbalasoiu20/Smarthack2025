# Zona Prezentări - Presentation System

Complete SaaS platform for non-linear, collaborative, AI-augmented presentations (similar to Prezi).

## Features Implemented

### Backend (Django REST Framework)
- Custom User model with email/username authentication
- Token-based authentication
- Complete REST API with ViewSets
- Models: User, Organization, Presentation, Frame, Element, Comment, CollaborationSession, AccessControlEntry
- UUID primary keys for all entities
- JSONField for flexible content storage

### Frontend (Next.js 15 + TypeScript)

#### Pages
- `/login` - User authentication
- `/dashboard` - User dashboard
- `/presentations` - List of all presentations
- `/presentations/[id]/edit` - Canvas editor for presentation
- `/presentations/[id]/view` - Presentation viewer mode

#### Canvas Editor Features
- Infinite canvas with zoom and pan
- Transform-based rendering (CSS transforms, not HTML canvas)
- Drag and drop for frames and elements
- Resize handles on all elements
- Double-click text to edit inline
- Properties panel for live editing
- Toolbar with tools:
  - Select tool
  - Add frame
  - Add text
  - Add rectangle
  - Add circle
  - Delete selected items
- Auto-save to backend (debounced)
- Zustand state management
- Keyboard shortcuts in viewer mode

## System Architecture

### State Management (Zustand)
File: `frontend/lib/stores/canvasStore.ts`

State includes:
- presentation: Current presentation data
- frames: Array of frames
- elements: Array of elements
- zoom, panX, panY: Viewport state
- selectedElementIds, selectedFrameId: Selection state
- tool: Current selected tool

### API Client
File: `frontend/lib/api/client.ts`

Provides methods for:
- Presentations CRUD
- Frames CRUD
- Elements CRUD
- Bulk update for performance
- Auto-redirect on 401 (unauthorized)

### Components

#### CanvasRenderer
File: `frontend/components/canvas/CanvasRenderer.tsx`
- Main canvas with transform-based zoom/pan
- Mouse events for canvas dragging (shift+drag or middle mouse)
- Scroll wheel zoom (ctrl+wheel) and pan
- Grid background pattern
- Zoom controls

#### FrameRenderer
File: `frontend/components/canvas/FrameRenderer.tsx`
- Renders individual frames
- Drag to move
- Resize handle in bottom-right corner
- Selection indicator

#### ElementRenderer
File: `frontend/components/canvas/ElementRenderer.tsx`
- Renders elements (text, image, shape)
- Drag to move
- 4 resize handles on corners
- Double-click text to edit inline
- Type-specific rendering

#### Toolbar
File: `frontend/components/canvas/Toolbar.tsx`
- Tools for creating content
- Delete button
- Shows selection count

#### FramesList
File: `frontend/components/canvas/FramesList.tsx`
- Sidebar showing all frames
- Click to select and center view
- Mini preview of each frame

#### PropertiesPanel
File: `frontend/components/canvas/PropertiesPanel.tsx`
- Properties editor for selected items
- Live update with debounced save
- Type-specific properties

## Canvas Controls

### Editor Mode
- **Shift + Drag** or **Middle Mouse**: Pan canvas
- **Ctrl + Scroll**: Zoom in/out
- **Scroll**: Pan vertically
- **Shift + Scroll**: Pan horizontally
- **Shift + Click**: Multi-select elements
- **Double-click text**: Edit text inline
- **Drag element**: Move element
- **Drag resize handle**: Resize element

### Viewer Mode
- **→ or Space**: Next frame
- **←**: Previous frame
- **F**: Toggle fullscreen
- **Esc**: Exit fullscreen

## Database Models

### User
- Custom user model
- Email and username authentication
- Password hashing

### Presentation
- Title, description
- Canvas config (width, height, background)
- Viewport state (zoom, pan)
- Owner relationship
- Frame and element relationships

### Frame
- Part of presentation
- Position (x, y)
- Size (width, height)
- Rotation
- Background color/image
- Order index for presentation sequence

### Element
- Part of presentation (optionally in a frame)
- Type: text, image, video, shape, line, arrow, icon
- Position (x, y)
- Size (width, height)
- Rotation, scale
- Z-index for layering
- Content (JSONField - flexible data)
- Style (JSONField)
- Locked flag

## API Endpoints

### Authentication
- POST `/api/auth/login/` - Login
- POST `/api/auth/logout/` - Logout
- POST `/api/auth/register/` - Register

### Presentations
- GET `/api/presentations/` - List presentations
- POST `/api/presentations/` - Create presentation
- GET `/api/presentations/:id/` - Get presentation details (includes frames and elements)
- PATCH `/api/presentations/:id/` - Update presentation
- DELETE `/api/presentations/:id/` - Delete presentation

### Frames
- GET `/api/frames/?presentation=:id` - List frames for presentation
- POST `/api/frames/` - Create frame
- GET `/api/frames/:id/` - Get frame
- PATCH `/api/frames/:id/` - Update frame
- DELETE `/api/frames/:id/` - Delete frame

### Elements
- GET `/api/elements/?presentation=:id` - List elements for presentation
- POST `/api/elements/` - Create element
- GET `/api/elements/:id/` - Get element
- PATCH `/api/elements/:id/` - Update element
- DELETE `/api/elements/:id/` - Delete element
- POST `/api/elements/bulk_update/` - Bulk update elements

## Running the System

### Backend
```bash
cd F:\Smarthack2025
python manage.py runserver
```

### Frontend
```bash
cd F:\Smarthack2025\frontend
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000/api

## Known Issues

1. **Migration conflict**: InconsistentMigrationHistory error due to custom User model changes
   - Solution: Reset database and reapply migrations
   - Command: `python manage.py migrate --run-syncdb`

## Not Yet Implemented

Based on initial specification but pending:
- WebSocket real-time collaboration (Django Channels)
- AI integration (presentation generation, text rewriting)
- Video overlay and recording
- Export functionality (PDF, video, images)
- Template system
- Brand kit management
- Asset library
- Comments UI (models exist)
- Analytics and tracking
- Mobile responsive design
- Offline support with Electron

## Technology Stack

### Backend
- Django 5.x
- Django REST Framework
- Token Authentication
- SQLite (development) / PostgreSQL (production ready)

### Frontend
- Next.js 15 (App Router)
- React 18
- TypeScript
- Zustand (state management)
- Tailwind CSS
- Fetch API for HTTP requests

## File Structure

```
F:\Smarthack2025\
├── api\                          # Django backend
│   ├── models.py                 # Database models
│   ├── serializers.py            # DRF serializers
│   ├── views.py                  # API views
│   ├── auth_backends.py          # Custom authentication
│   └── admin.py                  # Admin interface
├── frontend\
│   ├── app\
│   │   ├── login\                # Login page
│   │   ├── dashboard\            # Dashboard page
│   │   ├── presentations\
│   │   │   ├── page.tsx          # Presentations list
│   │   │   └── [id]\
│   │   │       ├── edit\         # Canvas editor
│   │   │       └── view\         # Presentation viewer
│   ├── components\
│   │   └── canvas\
│   │       ├── CanvasRenderer.tsx
│   │       ├── FrameRenderer.tsx
│   │       ├── ElementRenderer.tsx
│   │       ├── Toolbar.tsx
│   │       ├── FramesList.tsx
│   │       └── PropertiesPanel.tsx
│   └── lib\
│       ├── stores\
│       │   └── canvasStore.ts    # Zustand store
│       └── api\
│           └── client.ts         # API helper
└── smarthack2025\                # Django settings
```

## Next Steps

1. Fix migration issue (reset database)
2. Test complete flow end-to-end
3. Add WebSocket support for real-time collaboration
4. Implement AI features
5. Add export functionality
6. Mobile responsive design
7. Performance optimization for large presentations
