# Generated migration for discussion app

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('token_address', models.CharField(help_text='ERC-20 contract address (42 chars including 0x)', max_length=42)),
                ('owner_address', models.CharField(help_text='Wallet address of company owner with veto power', max_length=42)),
                ('total_supply', models.DecimalField(decimal_places=18, help_text='Total token supply (cached from blockchain)', max_digits=30, validators=[django.core.validators.MinValueValidator(0)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Companies',
                'db_table': 'discussion_company',
            },
        ),
        migrations.CreateModel(
            name='Proposal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=500)),
                ('description', models.TextField()),
                ('proposer_address', models.CharField(help_text='Wallet address of proposal creator', max_length=42)),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('DISCUSSION', 'Discussion'), ('VOTING', 'Voting'), ('PASSED', 'Passed'), ('FAILED', 'Failed'), ('DIED', 'Died'), ('VETOED', 'Vetoed')], default='DRAFT', max_length=20)),
                ('discussion_end', models.DateTimeField(blank=True, null=True)),
                ('voting_start', models.DateTimeField(blank=True, null=True)),
                ('voting_end', models.DateTimeField(blank=True, null=True)),
                ('snapshot_block', models.BigIntegerField(blank=True, help_text='Block number for voting weight snapshot', null=True)),
                ('yes_votes_weight', models.DecimalField(decimal_places=18, default=0, max_digits=30, validators=[django.core.validators.MinValueValidator(0)])),
                ('no_votes_weight', models.DecimalField(decimal_places=18, default=0, max_digits=30, validators=[django.core.validators.MinValueValidator(0)])),
                ('quorum_reached', models.BooleanField(default=False)),
                ('extension_count', models.IntegerField(default=0)),
                ('veto_count_year', models.IntegerField(default=0, help_text='Number of vetoes in current calendar year')),
                ('veto_date', models.DateTimeField(blank=True, help_text='Date when proposal was vetoed', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='proposals', to='discussion.company')),
            ],
            options={
                'db_table': 'discussion_proposal',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='VoteRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('voter_address', models.CharField(max_length=42)),
                ('choice', models.CharField(choices=[('YES', 'Yes'), ('NO', 'No')], max_length=3)),
                ('weight', models.DecimalField(decimal_places=18, max_digits=30, validators=[django.core.validators.MinValueValidator(0)])),
                ('tx_hash', models.CharField(max_length=66, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('proposal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vote_records', to='discussion.proposal')),
            ],
            options={
                'db_table': 'discussion_vote_record',
                'ordering': ['created_at'],
                'unique_together': {('proposal', 'voter_address')},
            },
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('recipient_address', models.CharField(help_text='Wallet address of notification recipient', max_length=42)),
                ('notification_type', models.CharField(choices=[('PROPOSAL_CREATED', 'Proposal Created'), ('VOTING_STARTED', 'Voting Started'), ('PROPOSAL_DIED', 'Proposal Died'), ('PROPOSAL_PASSED', 'Proposal Passed'), ('PROPOSAL_FAILED', 'Proposal Failed'), ('PROPOSAL_VETOED', 'Proposal Vetoed'), ('EXTENSION_GRANTED', 'Voting Extended')], max_length=30)),
                ('message', models.TextField()),
                ('read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('proposal', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='discussion.proposal')),
            ],
            options={
                'db_table': 'discussion_notification',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author_address', models.CharField(max_length=42)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('proposal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='discussion.proposal')),
            ],
            options={
                'db_table': 'discussion_comment',
                'ordering': ['created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='voterecord',
            index=models.Index(fields=['proposal', 'voter_address'], name='discussion_vote_proposal_voter_idx'),
        ),
        migrations.AddIndex(
            model_name='voterecord',
            index=models.Index(fields=['tx_hash'], name='discussion_vote_tx_hash_idx'),
        ),
        migrations.AddIndex(
            model_name='proposal',
            index=models.Index(fields=['company', 'status'], name='discussion_proposal_company_status_idx'),
        ),
        migrations.AddIndex(
            model_name='proposal',
            index=models.Index(fields=['proposer_address'], name='discussion_proposal_proposer_idx'),
        ),
        migrations.AddIndex(
            model_name='proposal',
            index=models.Index(fields=['voting_end'], name='discussion_proposal_voting_end_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['recipient_address', 'read'], name='discussion_notification_recipient_read_idx'),
        ),
        migrations.AddIndex(
            model_name='comment',
            index=models.Index(fields=['proposal', 'created_at'], name='discussion_comment_proposal_created_idx'),
        ),
    ]
