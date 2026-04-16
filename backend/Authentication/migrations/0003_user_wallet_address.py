# Generated migration for Authentication app to add wallet_address

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication_app', '0002_kyc'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='wallet_address',
            field=models.CharField(
                blank=True,
                help_text='Ethereum wallet address (42 chars including 0x)',
                max_length=42,
                null=True,
                unique=True
            ),
        ),
    ]
