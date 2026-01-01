"""
Cloudflare R2 Storage Utility
Uploads generated keyframes to R2 to avoid transient expiration
"""
import os
import base64
import logging
from typing import Optional, Union, BinaryIO
from io import BytesIO
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class R2Storage:
    """
    Cloudflare R2 storage client for uploading keyframes
    """
    
    def __init__(
        self,
        account_id: str,
        access_key_id: str,
        secret_access_key: str,
        bucket_name: str,
        endpoint_url: Optional[str] = None
    ):
        """
        Initialize R2 storage client
        
        Args:
            account_id: Cloudflare account ID
            access_key_id: R2 access key ID
            secret_access_key: R2 secret access key
            bucket_name: R2 bucket name
            endpoint_url: Optional custom endpoint URL
        """
        self.bucket_name = bucket_name
        
        # R2 uses S3-compatible API
        self.s3_client = boto3.client(
            's3',
            endpoint_url=endpoint_url or f"https://{account_id}.r2.cloudflarestorage.com",
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name='auto'  # R2 doesn't use regions
        )
    
    def upload_from_base64(
        self,
        base64_data: str,
        key: str,
        content_type: str = "image/png"
    ) -> str:
        """
        Upload base64-encoded image to R2
        
        Args:
            base64_data: Base64-encoded image data (with or without data URI prefix)
            key: S3 object key (path in bucket)
            content_type: MIME type of the image
            
        Returns:
            public_url: Public URL of uploaded file
            
        Raises:
            ClientError: If upload fails
        """
        # Remove data URI prefix if present
        if base64_data.startswith("data:"):
            base64_data = base64_data.split(",", 1)[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_data)
        
        return self.upload_from_bytes(image_bytes, key, content_type)
    
    def upload_from_bytes(
        self,
        data: bytes,
        key: str,
        content_type: str = "image/png"
    ) -> str:
        """
        Upload bytes to R2
        
        Args:
            data: Image bytes
            key: S3 object key (path in bucket)
            content_type: MIME type of the image
            
        Returns:
            public_url: Public URL of uploaded file
        """
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=data,
                ContentType=content_type
            )
            
            # Construct public URL (assuming public bucket or custom domain)
            # In production, you'd use a custom domain or signed URLs
            public_url = f"https://{self.bucket_name}.r2.cloudflarestorage.com/{key}"
            
            logger.info(f"Uploaded keyframe to R2: {key}")
            return public_url
            
        except ClientError as e:
            logger.error(f"Failed to upload to R2: {e}")
            raise
    
    def upload_from_url(
        self,
        url: str,
        key: str,
        content_type: Optional[str] = None
    ) -> str:
        """
        Download from URL and upload to R2
        
        Args:
            url: Source URL
            key: S3 object key (path in bucket)
            content_type: MIME type (auto-detected if None)
            
        Returns:
            public_url: Public URL of uploaded file
        """
        import requests
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        if content_type is None:
            content_type = response.headers.get("Content-Type", "image/png")
        
        return self.upload_from_bytes(response.content, key, content_type)
    
    def generate_keyframe_key(self, scene_id: str, prompt_index: int, extension: str = "png") -> str:
        """
        Generate S3 key for keyframe
        
        Args:
            scene_id: Scene ID
            prompt_index: Index of prompt in batch
            extension: File extension
            
        Returns:
            key: S3 object key
        """
        return f"keyframes/{scene_id}/{prompt_index:04d}.{extension}"
    
    def upload_video(
        self,
        video_path: str,
        key: str,
        content_type: str = "video/mp4"
    ) -> str:
        """
        Upload video file to R2
        
        Args:
            video_path: Path to local video file
            key: S3 object key (path in bucket)
            content_type: MIME type of the video
            
        Returns:
            public_url: Public URL of uploaded file
        """
        try:
            with open(video_path, "rb") as video_file:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=video_file,
                    ContentType=content_type
                )
            
            # Construct public URL
            public_url = f"https://{self.bucket_name}.r2.cloudflarestorage.com/{key}"
            
            logger.info(f"Uploaded video to R2: {key}")
            return public_url
            
        except ClientError as e:
            logger.error(f"Failed to upload video to R2: {e}")
            raise
        except FileNotFoundError as e:
            logger.error(f"Video file not found: {video_path}")
            raise
    
    def generate_episode_video_key(self, episode_id: str, extension: str = "mp4") -> str:
        """
        Generate S3 key for episode video
        
        Args:
            episode_id: Episode ID
            extension: File extension
            
        Returns:
            key: S3 object key
        """
        return f"episodes/{episode_id}/animatic.{extension}"

