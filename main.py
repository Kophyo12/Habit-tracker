from fastapi import FastAPI,Depends,HTTPException
from database import engine,Base,SessionLocal
import models
from sqlalchemy.orm import session
from schemas import HabitCreate, HabitResponse,HabitUpdate
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/habits")
def get_all_habits(db : session = Depends(get_db)):
    habits = db.query(models.Habit).all()
    return habits

@app.post("/habits", response_model=HabitResponse)
def create_habit(habit : HabitCreate, db : session = Depends(get_db)):
    new_habit = models.Habit(
        task = habit.task,
        description = habit.description
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)

    return new_habit

@app.get("/habits/{habit_id}",response_model=HabitResponse)
def get_habit_by_id(habit_id : int,db:session = Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()
    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found"
        )
    return habit

@app.put("/habits/{habit_id}",response_model=HabitResponse)
def update_habit(habit_id : int,habit_data : HabitUpdate,db:session=Depends(get_db)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id).first()

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found"
        )
    if habit_data.task is not None:
        habit.task = habit_data.task

    if habit_data.description is not None:
        habit.description = habit_data.description
    if habit_data.active is not None:
        habit.active = habit_data.active

    db.commit()
    db.refresh(habit)
    return habit

@app.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: int,
    db: session = Depends(get_db)
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id
    ).first()

    if habit is None:
        raise HTTPException(
            status_code=404,
            detail="Habit not found"
        )

    db.delete(habit)
    db.commit()

    return {
        "message": "Habit deleted successfully"
    }