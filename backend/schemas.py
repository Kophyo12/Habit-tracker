from pydantic import BaseModel
from datetime import datetime, date


class HabitCreate(BaseModel):
    task: str
    description: str | None = None


class HabitUpdate(BaseModel):
    task: str | None = None
    description: str | None = None
    active: bool | None = None


class HabitResponse(BaseModel):
    id: int
    task: str
    description: str | None
    created_at: datetime
    active: bool

    class Config:
        from_attributes = True


class CompletionCreate(BaseModel):
    date: date


class CompletionResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: bool

    class Config:
        from_attributes = True