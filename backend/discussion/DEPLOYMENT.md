# Installation & Deployment Guide

## Prerequisites

- Python 3.10+
- Django 4.0+
- PostgreSQL 12+ (for production) or SQLite (development)
- Redis 6+ (for Celery)
- Node.js 16+ (for frontend, if building React/Vue UI)
- Git

## Local Development Setup

### 1. Clone Repository & Setup Virtual Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd Nirman_Nightingle/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 2. Install Dependencies

```bash
# Install from main requirements
pip install -r requirements.txt

# Install discussion app dependencies
pip install -r discussion/requirements-discussion.txt

# Or combine them:
cat requirements.txt discussion/requirements-discussion.txt | pip install -r /dev/stdin
```

### 3. Create Environment Configuration

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

Update the following critical variables:
- `WEB3_PROVIDER_URL`: Your Infura/Alchemy endpoint
- `GOVERNANCE_CONTRACT_ADDRESS`: Your deployed contract
- `SECRET_KEY`: Generate with `django-admin shell`

### 4. Configure Database

```bash
# Run migrations
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser

# Verify setup
python manage.py check
```

### 5. Create Test Company

```bash
python manage.py shell
```

```python
from discussion.models import Company
from decimal import Decimal

Company.objects.create(
    name="Test Company",
    token_address="0x...",  # ERC-20 token on your network
    owner_address="0x...",  # Your wallet
    total_supply=Decimal("1000000000000000000000000")  # 1M tokens
)
```

### 6. Start Development Services

**Terminal 1: Redis**
```bash
redis-server
```

**Terminal 2: Celery Worker**
```bash
celery -A backend worker -l info
```

**Terminal 3: Celery Beat (optional, for scheduled tasks)**
```bash
celery -A backend beat -l info
```

**Terminal 4: Django Server**
```bash
python manage.py runserver
```

Access at:
- API: http://localhost:8000/api/governance/
- Admin: http://localhost:8000/admin/
- Documentation: http://localhost:8000/api/governance/docs/ (if Swagger configured)

## Production Deployment

### 1. Pre-Deployment Checklist

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run tests
python manage.py test discussion

# Check for security issues
python manage.py check --deploy

# Run linters
flake8 discussion/
black --check discussion/
```

### 2. Configure for Production

Update `.env` for production:

```env
DEBUG=False
SECRET_KEY=<generate-long-random-string>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Use PostgreSQL
DATABASE_URL=postgresql://user:password@db-host:5432/governance_db

# Use managed Redis
CELERY_BROKER_URL=redis://:password@redis-host:6379/0

# SSL/HTTPS
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# Email service
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### 3. Database Migration

If upgrading from development:

```bash
# Backup existing database
pg_dump production_db > backup.sql

# Run migrations
python manage.py migrate --database=production

# Verify migrations
python manage.py showmigrations
```

### 4. Deploy with Docker

Create `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt discussion/requirements-discussion.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r discussion/requirements-discussion.txt

# Copy application
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create logs directory
RUN mkdir -p logs

# Run migrations and start server
CMD python manage.py migrate && \
    gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: governance_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/governance_db
      CELERY_BROKER_URL: redis://redis:6379/0
      WEB3_PROVIDER_URL: ${WEB3_PROVIDER_URL}
      GOVERNANCE_CONTRACT_ADDRESS: ${GOVERNANCE_CONTRACT_ADDRESS}
    depends_on:
      - db
      - redis

  celery:
    build: .
    command: celery -A backend worker -l info
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/governance_db
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  celery-beat:
    build: .
    command: celery -A backend beat -l info
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/governance_db
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f web

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

### 5. Deploy with Heroku

Create `Procfile`:

```
web: gunicorn backend.wsgi --log-file -
worker: celery -A backend worker -l info
beat: celery -A backend beat -l info
```

Create `runtime.txt`:

```
python-3.10.12
```

Deploy:

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Add Redis addon
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set \
  SECRET_KEY=<your-secret-key> \
  WEB3_PROVIDER_URL=<your-provider> \
  GOVERNANCE_CONTRACT_ADDRESS=<your-contract> \
  DEBUG=False

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

### 6. Deploy with AWS Elastic Beanstalk

Create `.ebextensions/django.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: backend.wsgi:application
  aws:elasticbeanstalk:application:environment:
    PYTHONPATH: /var/app/current:$PYTHONPATH
  aws:autoscaling:launchconfiguration:
    InstanceType: t3.micro

commands:
  01_migrate:
    command: "source /var/app/venv/*/bin/activate && python manage.py migrate --noinput"
    leader_only: true
```

Deploy:

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.10 governance-app

# Create environment
eb create governance-prod

# Set environment variables
eb setenv \
  SECRET_KEY=<your-secret-key> \
  WEB3_PROVIDER_URL=<your-provider>

# Deploy
git add .
git commit -m "Deploy to EB"
eb deploy

# Check status
eb status
```

### 7. Set Up Monitoring

**Sentry** (Error Tracking):

```bash
pip install sentry-sdk
```

In `settings.py`:

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn@sentry.io/project-id",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=False
)
```

**NewRelic** (APM):

```bash
pip install newrelic
```

```bash
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program gunicorn backend.wsgi
```

### 8. Nginx Configuration

```nginx
upstream django {
    server web:8000;
}

server {
    listen 80;
    server_name yourdomain.com;
    client_max_body_size 100M;

    location /static/ {
        alias /app/staticfiles/;
    }

    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9. SSL/HTTPS with Let's Encrypt

```bash
# Using Certbot with Nginx
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring & Maintenance

### Health Checks

```bash
# Django health check
curl http://yourdomain.com/admin/login/

# API health
curl http://yourdomain.com/api/governance/companies/

# Database connection
python manage.py dbshell

# Celery worker status
celery -A backend inspect active
```

### Log Monitoring

```bash
# View Django logs
tail -f logs/discussion.log

# View Celery logs
tail -f logs/celery.log

# Filter by level
grep ERROR logs/discussion.log
```

### Database Maintenance

```bash
# Backup PostgreSQL
pg_dump -U postgres -h localhost governance_db > backup.sql

# Restore
psql -U postgres -h localhost governance_db < backup.sql

# Optimize indexes
python manage.py dbshell
VACUUM ANALYZE;
```

### Cache Management

```bash
# Clear Redis cache
redis-cli FLUSHALL

# Specific database
redis-cli -n 0 FLUSHDB
```

## Troubleshooting

### Common Issues

**Issue**: Web3 Connection Error
```
ConnectionError: HTTPProvider failed to make a connection
```
**Solution**: Verify WEB3_PROVIDER_URL is correct and endpoint is accessible

**Issue**: Celery Tasks Not Running
```
celery.exceptions.ConnectionError: Error [Errno 111] Connection refused
```
**Solution**: Ensure Redis is running and accessible

**Issue**: Database Migration Conflicts
```
django.core.management.base.SystemCheckError: System check identified some issues
```
**Solution**: Check for stale migrations: `python manage.py showmigrations`

**Issue**: Out of Memory on Celery Worker
```
MemoryError: Unable to allocate X bytes
```
**Solution**: Reduce CELERY_CONCURRENCY or increase worker memory

## Security Checklist

- [ ] Change `SECRET_KEY` to a long random string
- [ ] Set `DEBUG = False` in production
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookies (`SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`)
- [ ] Configure CORS properly (don't allow all origins)
- [ ] Use environment variables for sensitive data
- [ ] Run database backups daily
- [ ] Monitor error logs with Sentry
- [ ] Enable security headers (HSTS, CSP, X-Frame-Options)
- [ ] Use strong database passwords
- [ ] Rotate API keys regularly
- [ ] Update dependencies regularly (`pip list --outdated`)

## Performance Optimization

```python
# settings.py

# Database connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 600

# Caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Compression
MIDDLEWARE.append('django.middleware.gzip.GZipMiddleware')

# Cache templates
TEMPLATES[0]['OPTIONS']['loaders'] = [
    ('django.template.loaders.cached.Loader', [
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
    ]),
]
```

## Backup & Disaster Recovery

```bash
#!/bin/bash
# backup.sh - Automated daily backup

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/governance"

# Database backup
pg_dump -U postgres governance_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-bucket/backups/

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

Schedule with cron:
```
0 2 * * * /path/to/backup.sh
```

## Versioning & Updates

```bash
# Check for outdated packages
pip list --outdated

# Update packages safely
pip install --upgrade-package <package-name>

# Test updates
python manage.py test

# Deploy updates
git commit -am "Update dependencies"
git push
```
