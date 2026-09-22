"""
Supabase Storage helper for SwissMax E-Commerce.

Usage:
    from Ecommerce.supabase_storage import upload_to_supabase

    public_url = upload_to_supabase(file_obj, filename)
    # Returns None if Supabase is not configured — callers should fall back to local storage.
"""

import uuid
import os
from django.conf import settings


def _get_client():
    """Return an authenticated Supabase client, or None if not configured."""
    url = getattr(settings, 'SUPABASE_URL', '')
    key = getattr(settings, 'SUPABASE_SERVICE_KEY', '')
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning('Could not create Supabase client: %s', e)
        return None


def upload_to_supabase(file_obj, original_name: str, folder: str = 'uploads') -> str | None:
    """
    Upload a file-like object to Supabase Storage.

    Args:
        file_obj: A Django InMemoryUploadedFile / TemporaryUploadedFile,
                  or any object with a .read() method.
        original_name: Original filename (used to infer the extension).
        folder: Sub-folder inside the bucket (e.g. 'products', 'categories').

    Returns:
        The public URL of the uploaded file, or None on failure.
    """
    client = _get_client()
    if client is None:
        return None

    bucket = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'ecommerce-media')

    # Build a unique path so files never overwrite each other
    ext = os.path.splitext(original_name)[1].lower() or '.bin'
    storage_path = f"{folder}/{uuid.uuid4().hex}{ext}"

    try:
        file_bytes = file_obj.read()
        # Determine MIME type from extension
        mime_map = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.gif': 'image/gif',
            '.webp': 'image/webp', '.svg': 'image/svg+xml',
        }
        content_type = mime_map.get(ext, 'application/octet-stream')

        client.storage.from_(bucket).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "false"},
        )

        # Build the public URL
        # Format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
        url = settings.SUPABASE_URL.rstrip('/')
        public_url = f"{url}/storage/v1/object/public/{bucket}/{storage_path}"
        return public_url

    except Exception as e:
        import logging
        logging.getLogger(__name__).error('Supabase upload failed: %s', e)
        return None


def delete_from_supabase(public_url: str) -> bool:
    """
    Delete a file from Supabase Storage given its public URL.
    Returns True on success, False on failure or if not a Supabase URL.
    """
    client = _get_client()
    if client is None:
        return False

    bucket = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'ecommerce-media')

    try:
        # Extract storage path from URL
        # URL format: .../storage/v1/object/public/{bucket}/{path}
        marker = f'/object/public/{bucket}/'
        if marker not in public_url:
            return False
        storage_path = public_url.split(marker, 1)[1]
        client.storage.from_(bucket).remove([storage_path])
        return True
    except Exception as e:
        import logging
        logging.getLogger(__name__).error('Supabase delete failed: %s', e)
        return False
