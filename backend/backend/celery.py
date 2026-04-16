"""
Celery configuration for the project.
Place this file in the main app package (backend/celery.py) and import in backend/__init__.py
"""
import os
from celery import Celery
from celery.schedules import crontab
from django.conf import settings

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Load configuration from Django settings with namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from installed apps
app.autodiscover_tasks()

# Configure periodic tasks (Celery Beat)
app.conf.beat_schedule = {
    'check-quorum-every-hour': {
        'task': 'discussion.tasks.task_check_quorum_periodically',
        'schedule': crontab(minute=0),  # Every hour at :00
        'options': {'queue': 'default'}
    },
    'sync-token-supply-daily': {
        'task': 'discussion.tasks.task_sync_token_supply',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight UTC
        'options': {'queue': 'default'}
    },
}

# Broker and Backend Configuration
app.conf.broker_url = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
app.conf.result_backend = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Celery Settings
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes hard limit
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    worker_concurrency=4,
    worker_prefetch_multiplier=4,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
)

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery setup."""
    print(f'Request: {self.request!r}')


if __name__ == '__main__':
    app.start()
