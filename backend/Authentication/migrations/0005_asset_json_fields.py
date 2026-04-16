# Generated migration for Asset model JSONField changes
from django.db import migrations, models
import json


def convert_photo_to_property_images(apps, schema_editor):
    """
    Convert existing photo field to property_images JSON array.
    If photo exists, create a JSON array with one entry.
    """
    Asset = apps.get_model('authentication_app', 'Asset')
    for asset in Asset.objects.all():
        if asset.photo:
            # Convert single photo to array format
            property_images = [{"name": "main_image", "url": asset.photo, "file_type": "jpg"}]
            asset.property_images = property_images
        else:
            asset.property_images = []
        asset.save()


def convert_legal_documents_to_json(apps, schema_editor):
    """
    Convert existing legal_documents field to JSON object.
    If it contains valid JSON, use it; otherwise create empty object.
    """
    Asset = apps.get_model('authentication_app', 'Asset')
    for asset in Asset.objects.all():
        if asset.legal_documents:
            try:
                # Try to parse as JSON
                legal_docs = json.loads(asset.legal_documents)
                if isinstance(legal_docs, dict):
                    asset.legal_documents = legal_docs
                else:
                    asset.legal_documents = {}
            except (json.JSONDecodeError, TypeError):
                # If not valid JSON, create empty object
                asset.legal_documents = {}
        else:
            asset.legal_documents = {}
        asset.save()


class Migration(migrations.Migration):

    dependencies = [
        ('authentication_app', '0004_kyc_documents_submitted_at_kyc_passport_number_and_more'),
    ]

    operations = [
        # Add new JSONField columns first
        migrations.AddField(
            model_name='asset',
            name='property_images',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='asset',
            name='certificates',
            field=models.JSONField(blank=True, default=list),
        ),
        # Data migration to convert existing photo to property_images
        migrations.RunPython(convert_photo_to_property_images, migrations.RunPython.noop),
        # Data migration to ensure legal_documents is valid JSON
        migrations.RunPython(convert_legal_documents_to_json, migrations.RunPython.noop),
        # Convert legal_documents to JSONField
        migrations.AlterField(
            model_name='asset',
            name='legal_documents',
            field=models.JSONField(blank=True, default=dict),
        ),
        # Remove old photo field
        migrations.RemoveField(
            model_name='asset',
            name='photo',
        ),
        # Fix User wallet_address duplicate
        migrations.AlterField(
            model_name='user',
            name='wallet_address',
            field=models.CharField(blank=True, help_text='Ethereum wallet address (42 chars including 0x)', max_length=42, null=True, unique=True),
        ),
    ]
