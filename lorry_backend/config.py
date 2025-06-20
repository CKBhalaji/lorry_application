from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = 'postgresql://postgres:2003@localhost:5432/LorryDatabase'
    SECRET_KEY: str = 'your_very_secret_key_here_please_change_me' # IMPORTANT: Generate a strong secret key
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Default to 30 minutes

    # For file uploads if you store them locally (example)
    UPLOAD_DIRECTORY: str = 'uploads'

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'

settings = Settings()

# Create the UPLOAD_DIRECTORY if it doesn't exist
if not os.path.exists(settings.UPLOAD_DIRECTORY):
    os.makedirs(settings.UPLOAD_DIRECTORY)
