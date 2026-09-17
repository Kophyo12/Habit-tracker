from pydantic import BaseModel
from datetime import datetime

class HabitCreate(BaseModel):
    task : str
    description : str | None = None

class HabitUpdate(BaseModel):
    task : str
    description : str | None = None
    active : bool | None = None


class HabitResponse(BaseModel):
    id : int
    task : str
    description : str | None
    created_at : datetime
    active : bool

    class Config:
            from_attributes = True