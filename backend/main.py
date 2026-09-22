from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import extract

from database import engine, Base, SessionLocal

import models

from schemas import (
    HabitCreate,
    HabitResponse,
    HabitUpdate,
    CompletionCreate,
    CompletionResponse
)


# ========================================
# DATABASE
# ========================================

Base.metadata.create_all(bind=engine)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ========================================
# FASTAPI
# ========================================

app = FastAPI()


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ========================================
# GET ALL HABITS
# ========================================

@app.get(
    "/habits",
    response_model=list[HabitResponse]
)
def get_all_habits(
    db: Session = Depends(get_db)
):

    habits = db.query(
        models.Habit
    ).all()

    return habits


# ========================================
# CREATE HABIT
# ========================================

@app.post(
    "/habits",
    response_model=HabitResponse
)
def create_habit(
    habit: HabitCreate,
    db: Session = Depends(get_db)
):

    new_habit = models.Habit(
        task=habit.task,
        description=habit.description
    )

    db.add(new_habit)

    db.commit()

    db.refresh(new_habit)

    return new_habit


# ========================================
# GET ONE HABIT
# ========================================

@app.get(
    "/habits/{habit_id}",
    response_model=HabitResponse
)
def get_habit_by_id(
    habit_id: int,
    db: Session = Depends(get_db)
):

    habit = db.query(
        models.Habit
    ).filter(
        models.Habit.id == habit_id
    ).first()

    if habit is None:

        raise HTTPException(
            status_code=404,
            detail="Habit not found"
        )

    return habit


# ========================================
# UPDATE HABIT
# ========================================

@app.put(
    "/habits/{habit_id}",
    response_model=HabitResponse
)
def update_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    db: Session = Depends(get_db)
):

    habit = db.query(
        models.Habit
    ).filter(
        models.Habit.id == habit_id
    ).first()

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


# ========================================
# DELETE HABIT
# ========================================

@app.delete("/habits/{habit_id}")
def delete_habit(
    habit_id: int,
    db: Session = Depends(get_db)
):

    habit = db.query(
        models.Habit
    ).filter(
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


# ========================================
# TOGGLE COMPLETION
# ========================================

@app.post(
    "/habits/{habit_id}/complete",
    response_model=CompletionResponse
)
def toggle_completion(
    habit_id: int,
    completion_data: CompletionCreate,
    db: Session = Depends(get_db)
):

    habit = db.query(
        models.Habit
    ).filter(
        models.Habit.id == habit_id
    ).first()

    if habit is None:

        raise HTTPException(
            status_code=404,
            detail="Habit not found"
        )

    completion = db.query(
        models.HabitCompletion
    ).filter(

        models.HabitCompletion.habit_id
        == habit_id,

        models.HabitCompletion.date
        == completion_data.date

    ).first()


    # First click
    if completion is None:

        completion = models.HabitCompletion(
            habit_id=habit_id,
            date=completion_data.date,
            completed=True
        )

        db.add(completion)


    # Later clicks toggle True / False
    else:

        completion.completed = (
            not completion.completed
        )


    db.commit()

    db.refresh(completion)

    return completion


# ========================================
# GET MONTH COMPLETIONS
# ========================================

@app.get(
    "/completions",
    response_model=list[CompletionResponse]
)
def get_completions(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):

    completions = db.query(
        models.HabitCompletion
    ).filter(

        extract(
            "year",
            models.HabitCompletion.date
        ) == year,

        extract(
            "month",
            models.HabitCompletion.date
        ) == month,

        models.HabitCompletion.completed == True

    ).all()

    return completions