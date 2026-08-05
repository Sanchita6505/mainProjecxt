from sqlalchemy.ext.asyncio import AsyncSession


class ReadOnlyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
