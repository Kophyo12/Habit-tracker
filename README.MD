# Habit Tracker

A simple full-stack habit tracking web application that helps users create habits, track daily completion, and view their progress over time.

This project was built to practice full-stack development and understand how a frontend, REST API, and database work together.

## Features

* Create, edit, and delete habits
* Mark habits as completed
* Track daily habit progress
* Navigate between different months
* Store habits and completion data persistently
* Responsive web interface

## Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Python
* FastAPI
* SQLAlchemy

**Database**

* PostgreSQL

**Deployment**

* Railway

## Project Structure

```text
Habit-tracker/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.md
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/Kophyo12/Habit-tracker.git
cd Habit-tracker
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Create a `.env` file with your PostgreSQL connection:

```env
DATABASE_URL=your_postgresql_connection_url
```

Start the backend:

```bash
cd backend
uvicorn main:app --reload
```

Then open the frontend using a local development server such as VS Code Live Server.

## API Documentation

When the backend is running locally, FastAPI's interactive documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## Author

**Phyo Min Tun**

Computer Science student interested in backend and full-stack development.
