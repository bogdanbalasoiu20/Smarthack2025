# Production Deployment Guide (Ubuntu 24.04)

The stack consists of:

- **Backend:** Django 5 + Channels + Daphne (`smarthack2025`).
- **Frontend:** Next.js 16 app living in the `frontend` directory.
- **Database:** MySQL/MariaDB (see `smarthack2025/settings.py`).
- **WebSockets:** Served through ASGI (`/ws/...` paths), currently using the in-memory channel layer (good for a single Daphne worker).

The instructions below walk through a fresh Ubuntu 24.04 VPS, from packages to Nginx, HTTPS, and systemd services.

---

## 1. Prepare the Server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential python3 python3-venv python3-pip \
  mysql-server libmysqlclient-dev nginx supervisor ufw

# Optional but recommended for Channels scaling
sudo apt install -y redis-server

# Allow basic firewall rules
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

Install Node.js 20 (needed for the Next.js frontend):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Database (MariaDB/MySQL)

```bash
sudo mysql_secure_installation   # follow prompts (set root password, remove test DB, etc.)

sudo mysql -u root -p
```

Inside the MySQL shell:

```sql
CREATE DATABASE smarthack2025 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON smarthack2025.* TO 'django_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Update `smarthack2025/settings.py` with the real password (or refactor the file to read from environment variables).

## 3. Clone the Project

```bash
sudo adduser --disabled-password --gecos "" smarthack
sudo usermod -aG sudo smarthack
sudo su - smarthack

git clone https://github.com/<your-account>/Smarthack2025.git
cd Smarthack2025
```

## 4. Configure Django (backend)

1. **Virtual environment & dependencies**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **Production settings checklist**
   - Edit `smarthack2025/settings.py`:
     - Set `DEBUG = False`.
     - Add your domain/IP to `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
     - Replace the included `SECRET_KEY` with a secure value.
     - If you installed Redis and want multi-worker Channels support, point `CHANNEL_LAYERS` to `channels_redis.core.RedisChannelLayer`.
   - Create directories for static/media:
     ```bash
     mkdir -p ~/Smarthack2025/runtime/static ~/Smarthack2025/runtime/media
     ```
   - Optional: create `.env` files and import them in `settings.py` (currently values are hard-coded).

3. **Migrations, static files, superuser**
   ```bash
   python manage.py migrate
   python manage.py collectstatic  # outputs to STATIC_ROOT, update settings if needed
   python manage.py createsuperuser
   ```

4. **Quick smoke test**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   Stop it once you verify the API works.

## 5. Configure Next.js (frontend)

```bash
cd ~/Smarthack2025/frontend
npm ci
```

Create `frontend/.env.production` with your public endpoints:

```
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
```

Build the app:

```bash
npm run build
```

You will later run `npm run start -- -p 3000` under systemd.

## 6. Systemd Services

### Backend (`daphne`)

`/etc/systemd/system/smarthack-backend.service`
```ini
[Unit]
Description=Smarthack2025 Django (Daphne)
After=network.target mysql.service

[Service]
User=smarthack
Group=smarthack
WorkingDirectory=/home/smarthack/Smarthack2025
Environment="DJANGO_SETTINGS_MODULE=smarthack2025.settings"
ExecStart=/home/smarthack/Smarthack2025/.venv/bin/daphne \
  -b 127.0.0.1 -p 8001 smarthack2025.asgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Frontend (Next.js)

`/etc/systemd/system/smarthack-frontend.service`
```ini
[Unit]
Description=Smarthack2025 Next.js frontend
After=network.target

[Service]
User=smarthack
Group=smarthack
WorkingDirectory=/home/smarthack/Smarthack2025/frontend
Environment="PORT=3000"
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always

[Install]
WantedBy=multi-user.target
```

Reload and enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now smarthack-backend smarthack-frontend
```

Check logs via:
```bash
journalctl -u smarthack-backend -f
journalctl -u smarthack-frontend -f
```

## 7. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/smarthack`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 25M;

    location /static/ {
        alias /home/smarthack/Smarthack2025/runtime/static/;
    }

    location /media/ {
        alias /home/smarthack/Smarthack2025/runtime/media/;
    }

    # WebSockets for Channels
    location /ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/smarthack /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 8. HTTPS (optional but recommended)

Use Let’s Encrypt once DNS is pointing to your VPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot automatically inserts the TLS blocks and reloads Nginx. Certificates live in `/etc/letsencrypt/`.

## 9. Maintenance Tips

- **Updating the app**
  ```bash
  sudo su - smarthack
  cd ~/Smarthack2025
  git pull
  source .venv/bin/activate
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py collectstatic
  cd frontend && npm ci && npm run build
  sudo systemctl restart smarthack-backend smarthack-frontend
  ```

- **Logs:** `journalctl -u ...`, `sudo tail -f /var/log/nginx/error.log`.
- **Backups:** dump MySQL regularly (`mysqldump smarthack2025 > backup.sql`).
- **Scaling Channels:** switch the `CHANNEL_LAYERS` backend from in-memory to Redis if you need multiple Daphne workers.

With the two systemd services running and Nginx proxying `/api` + `/ws` to Daphne and everything else to Next.js, your Smarthack2025 instance is live on the VPS.
