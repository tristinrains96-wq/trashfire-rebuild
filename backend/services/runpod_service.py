"""
RunPod Serverless Service for SDXL Keyframe Generation
Handles async/sync job submission and polling
"""
import os
import time
import requests
import logging
from typing import Dict, Optional, Any, List
from enum import Enum

logger = logging.getLogger(__name__)


class RunPodJobStatus(str, Enum):
    """RunPod job status states"""
    IN_QUEUE = "IN_QUEUE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class RunPodService:
    """
    Service for interacting with RunPod serverless endpoints
    """
    
    BASE_URL = "https://api.runpod.ai/v2"
    
    def __init__(self, endpoint_id: str, api_key: str):
        """
        Initialize RunPod service
        
        Args:
            endpoint_id: RunPod endpoint ID (created manually via dashboard)
            api_key: RunPod API key
        """
        self.endpoint_id = endpoint_id
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    
    def run_async(self, input_data: Dict[str, Any]) -> str:
        """
        Submit async job to RunPod endpoint
        
        Args:
            input_data: Input dictionary for the worker
            
        Returns:
            job_id: RunPod job ID
            
        Raises:
            requests.RequestException: If API call fails
        """
        url = f"{self.BASE_URL}/{self.endpoint_id}/run"
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json={"input": input_data},
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            job_id = result.get("id")
            
            if not job_id:
                raise ValueError(f"Invalid response from RunPod: {result}")
            
            logger.info(f"RunPod async job submitted: {job_id}")
            return job_id
            
        except requests.RequestException as e:
            logger.error(f"Failed to submit RunPod async job: {e}")
            raise
    
    def run_sync(self, input_data: Dict[str, Any], timeout_s: int = 600) -> Dict[str, Any]:
        """
        Submit sync job to RunPod endpoint (waits for completion)
        
        Args:
            input_data: Input dictionary for the worker
            timeout_s: Maximum wait time in seconds (default 600)
            
        Returns:
            result: Worker output dictionary
            
        Raises:
            requests.RequestException: If API call fails
            TimeoutError: If job exceeds timeout
        """
        url = f"{self.BASE_URL}/{self.endpoint_id}/runsync"
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json={"input": input_data},
                timeout=timeout_s + 10  # Add buffer for network
            )
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"RunPod sync job completed")
            return result
            
        except requests.Timeout:
            logger.error(f"RunPod sync job timed out after {timeout_s}s")
            raise TimeoutError(f"Job exceeded timeout of {timeout_s}s")
        except requests.RequestException as e:
            logger.error(f"Failed to submit RunPod sync job: {e}")
            raise
    
    def poll_status(self, job_id: str) -> Dict[str, Any]:
        """
        Poll RunPod job status
        
        Args:
            job_id: RunPod job ID
            
        Returns:
            status_dict: Dictionary with status, output, error, etc.
            
        Raises:
            requests.RequestException: If API call fails
        """
        url = f"{self.BASE_URL}/{self.endpoint_id}/status/{job_id}"
        
        try:
            response = requests.get(
                url,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
            
            return result
            
        except requests.RequestException as e:
            logger.error(f"Failed to poll RunPod job {job_id}: {e}")
            raise
    
    def run_and_wait(
        self,
        job_id: Optional[str] = None,
        input_data: Optional[Dict[str, Any]] = None,
        max_wait_s: int = 600,
        poll_interval_s: float = 2.0,
        max_poll_interval_s: float = 30.0
    ) -> Dict[str, Any]:
        """
        Run job and wait for completion with exponential backoff
        
        Args:
            job_id: Existing RunPod job ID (if None, submits new async job)
            input_data: Input data (required if job_id is None)
            max_wait_s: Maximum total wait time in seconds
            poll_interval_s: Initial poll interval in seconds
            max_poll_interval_s: Maximum poll interval in seconds
            
        Returns:
            result: Completed job result
            
        Raises:
            TimeoutError: If job exceeds max_wait_s
            ValueError: If job fails
        """
        # Submit job if not provided
        if job_id is None:
            if input_data is None:
                raise ValueError("Either job_id or input_data must be provided")
            job_id = self.run_async(input_data)
        
        start_time = time.time()
        current_interval = poll_interval_s
        
        while True:
            # Check timeout
            elapsed = time.time() - start_time
            if elapsed > max_wait_s:
                raise TimeoutError(f"Job {job_id} exceeded max wait time of {max_wait_s}s")
            
            # Poll status
            status_data = self.poll_status(job_id)
            status = status_data.get("status")
            
            if status == RunPodJobStatus.COMPLETED:
                logger.info(f"RunPod job {job_id} completed")
                return status_data
            
            elif status == RunPodJobStatus.FAILED:
                error = status_data.get("error", "Unknown error")
                logger.error(f"RunPod job {job_id} failed: {error}")
                raise ValueError(f"Job failed: {error}")
            
            elif status in [RunPodJobStatus.IN_QUEUE, RunPodJobStatus.IN_PROGRESS]:
                # Exponential backoff
                time.sleep(current_interval)
                current_interval = min(current_interval * 1.5, max_poll_interval_s)
                continue
            
            else:
                logger.warning(f"Unknown RunPod job status: {status}")
                time.sleep(current_interval)
                current_interval = min(current_interval * 1.5, max_poll_interval_s)

