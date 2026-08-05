import uvicorn


from app.main import app
from app.config.settings import get_settings


def main() -> None:
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=False,
    )


if __name__ == "__main__":
    main()
