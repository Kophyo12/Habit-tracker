from fastapi import FastAPI
from database import engine,Base
import models

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def root():
    return {"message": "Habit Tracker API is running"}