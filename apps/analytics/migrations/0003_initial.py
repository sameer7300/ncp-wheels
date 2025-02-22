# Generated by Django 5.1.5 on 2025-01-30 13:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('analytics', '0002_initial'),
        ('cars', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='featuredlistinginteraction',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='featured_listing_interactions', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='featuredlistingview',
            name='featured_listing',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='view_records', to='cars.featuredlisting'),
        ),
        migrations.AddField(
            model_name='featuredlistingview',
            name='viewer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='featured_listing_views', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='dailyanalytics',
            index=models.Index(fields=['featured_listing', 'date'], name='analytics_d_feature_4b1ff7_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='dailyanalytics',
            unique_together={('featured_listing', 'date')},
        ),
        migrations.AddIndex(
            model_name='featuredlistinginteraction',
            index=models.Index(fields=['featured_listing', 'interaction_type', 'timestamp'], name='analytics_f_feature_61d59c_idx'),
        ),
        migrations.AddIndex(
            model_name='featuredlistinginteraction',
            index=models.Index(fields=['user', 'interaction_type', 'timestamp'], name='analytics_f_user_id_7d37e8_idx'),
        ),
        migrations.AddIndex(
            model_name='featuredlistingview',
            index=models.Index(fields=['featured_listing', 'timestamp'], name='analytics_f_feature_bea799_idx'),
        ),
        migrations.AddIndex(
            model_name='featuredlistingview',
            index=models.Index(fields=['viewer', 'timestamp'], name='analytics_f_viewer__433486_idx'),
        ),
    ]
