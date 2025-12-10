from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from django.core.files import File
from django.conf import settings
from catalog.models import ProductImage, Product
import os
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Sync missing media files from local MEDIA_ROOT to S3-compatible storage (Cloudflare R2)."

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Only print actions, do not upload')

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        media_root = str(getattr(settings, 'MEDIA_ROOT', 'media'))
        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', '')
        domain = getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', '')
        self.stdout.write(self.style.NOTICE(f"MEDIA_ROOT: {media_root}"))
        self.stdout.write(self.style.NOTICE(f"Bucket: {bucket}"))
        self.stdout.write(self.style.NOTICE(f"Domain: {domain}"))

        # Ensure media_root exists
        if not os.path.isdir(media_root):
            self.stdout.write(self.style.WARNING(f"MEDIA_ROOT not found: {media_root}"))

        uploaded = 0
        skipped = 0
        missing_local = 0

        # Sync product images
        for img in ProductImage.objects.all():
            name = getattr(img.image, 'name', '') or ''
            if not name:
                continue
            local_path = os.path.join(media_root, name.replace('..', '').lstrip('/'))
            exists_remote = False
            try:
                exists_remote = default_storage.exists(name)
            except Exception:
                # If the backend errors, try to upload anyway
                exists_remote = False

            if exists_remote:
                skipped += 1
                continue

            if not os.path.isfile(local_path):
                missing_local += 1
                logger.warning(f"Local file not found for {name}: {local_path}")
                continue

            if dry_run:
                self.stdout.write(f"Would upload: {name}")
                uploaded += 1
                continue

            with open(local_path, 'rb') as f:
                default_storage.save(name, File(f))
                uploaded += 1
                self.stdout.write(self.style.SUCCESS(f"Uploaded: {name}"))

        # Sync product PDFs
        for p in Product.objects.exclude(catalog_pdf=''):
            name = getattr(p.catalog_pdf, 'name', '') or ''
            if not name:
                continue
            local_path = os.path.join(media_root, name.replace('..', '').lstrip('/'))
            try:
                exists_remote = default_storage.exists(name)
            except Exception:
                exists_remote = False

            if exists_remote:
                continue

            if not os.path.isfile(local_path):
                logger.warning(f"Local PDF not found for {name}: {local_path}")
                continue

            if not dry_run:
                with open(local_path, 'rb') as f:
                    default_storage.save(name, File(f))
                    self.stdout.write(self.style.SUCCESS(f"Uploaded PDF: {name}"))

        self.stdout.write(self.style.SUCCESS(f"Sync complete. Uploaded: {uploaded}, Skipped (already remote): {skipped}, Missing local: {missing_local}"))
