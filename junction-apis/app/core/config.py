from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Junction APIs"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database configuration
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "dpg-d1sqhnemcj7s73aqkku0-a.oregon-postgres.render.com"
    POSTGRES_USER: str = "junction_database_user"
    POSTGRES_PASSWORD: str = "u7zBOps4rfMWLEfjqASt30fLOf1tzUN0"
    POSTGRES_DB: str = "junction_database"
    POSTGRES_PORT: str = "5432"
    
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    class Config:
        env_file = ".env"
    
    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()