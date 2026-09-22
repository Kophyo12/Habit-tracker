const API_URL = "http://127.0.0.1:8000";

let editingHabitId = null;

const today = new Date()
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // September. January = 0
let selectedDay = today.getDate();

let completions = {};
let totalHabits = 0;

function getDateKey(day) {

    const month =
        String(currentMonth + 1).padStart(2, "0");

    const formattedDay =
        String(day).padStart(2, "0");

    return `${currentYear}-${month}-${formattedDay}`;
}



// ========================================
//  LOAD HABITS FROM BACKEND
// ========================================

async function loadHabits() {

    const response = await fetch(`${API_URL}/habits`);

    const habits = await response.json();

    displayHabits(habits);
}


// ========================================
//  DISPLAY HABITS
// ========================================

function displayHabits(habits) {

    const habitTracker = document.getElementById("habit-tracker");

    habitTracker.innerHTML = "";
    totalHabits = habits.length;


    habits.forEach(function(habit) {

        // Create one row
        const habitRow = document.createElement("div");

        habitRow.className = "habit-row";

        // Store database ID in this row
        habitRow.dataset.habitId = habit.id;


        // Create visible content
        habitRow.innerHTML = `
            <div class="habit-name">

                <span class="habit-check">□</span>

                <span class="habit-title">
                    ${habit.task}
                </span>

            </div>

            <div class="habit-actions">

                <button class="edit-btn">
                    Edit
                </button>

                <button class="delete-btn">
                    Delete
                </button>

            </div>
        `;


        // ========================================
        // GET ELEMENTS FROM THIS HABIT ROW
        // ========================================

        const checkBox =
            habitRow.querySelector(".habit-check");

        const habitTitle =
            habitRow.querySelector(".habit-title");

        const editButton =
            habitRow.querySelector(".edit-btn");

        const deleteButton =
            habitRow.querySelector(".delete-btn");


        // ========================================
        // CHECK / UNCHECK HABIT
        // ========================================

        checkBox.addEventListener("click", function() {

        const habitId = habitRow.dataset.habitId;
        const dateKey = getDateKey(selectedDay);

        if (!completions[dateKey]) {
            completions[dateKey] = [];
        }

        if (checkBox.textContent === "□") {

            checkBox.textContent = "✓";
            habitTitle.style.textDecoration = "line-through";

            completions[dateKey].push(habitId);

        } else {

            checkBox.textContent = "□";
            habitTitle.style.textDecoration = "none";

            completions[dateKey] =
                completions[dateKey].filter(function(id) {
                    return id !== habitId;
                });
        }

        updateProgress(dateKey);

        console.log("Completions:", completions);
});

        // ========================================
        // EDIT HABIT
        // ========================================

        editButton.addEventListener("click", function() {

            const nameInput =
                document.getElementById("habit-name");

            const descriptionInput =
                document.getElementById(
                    "habit-description"
                );


            // Remember which habit we're editing
            editingHabitId = habit.id;


            // Put existing data into the form
            nameInput.value = habit.task;

            descriptionInput.value =
                habit.description || "";


            // Show form
            habitForm.style.display = "block";
        });


        // ========================================
        // DELETE HABIT
        // ========================================

        deleteButton.addEventListener("click", async function() {

            const habitId = habitRow.dataset.habitId;

            const response = await fetch(
                `${API_URL}/habits/${habit.id}`,
                {
                    method: "DELETE"
                }
            );

            if (response.ok) {

                // Remove the habit from the page
                habitRow.remove();

                // Remove it from completions if it was completed
                if (completions[selectedDay]) {

                    completions[selectedDay] =
                        completions[selectedDay].filter(function(id) {
                            return id !== habitId;
                        });
                }

                // One less total habit
                totalHabits--;

                // Recalculate the progress color
                updateProgress(selectedDay);

                console.log("After delete:");
                console.log("Completions:", completions[selectedDay]);
                console.log("Total habits:", totalHabits);
            }
        });
        // Finally put this row on the page
        habitTracker.appendChild(habitRow);
    });
}
//===========================
//DISPLAYING TODAY DATE
//===========================
function displayTodayDate(){
    const todayDate =
        document.getElementById("today-date");

    todayDate.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
}


//==========
// UPDATE THE PROGRESS
//=========
function updateProgress(day) {

    let completedHabits = 0;

    if (completions[day]) {
        completedHabits = completions[day].length;
    }

    let completionRate = 0;

    if (totalHabits > 0) {
        completionRate = completedHabits / totalHabits;
    }

    const dayBox = document.querySelector(
        `.progress-day[data-day="${day}"]`
    );

    if (!dayBox) {
        return;
    }

    // Always remove the previous color first
    dayBox.classList.remove(
        "level-1",
        "level-2",
        "level-3",
        "level-4"
    );

    // If nothing is completed, leave it with no level class
    if (completionRate === 0) {
        return;
    }

    if (completionRate <= 0.25) {
        dayBox.classList.add("level-1");
    }
    else if (completionRate <= 0.50) {
        dayBox.classList.add("level-2");
    }
    else if (completionRate <= 0.75) {
        dayBox.classList.add("level-3");
    }
    else {
        dayBox.classList.add("level-4");
    }

    console.log("Day:", day);
    console.log("Completed:", completedHabits);
    console.log("Total:", totalHabits);
    console.log("Rate:", completionRate);
}

// ========================================
// 3. CREATE MONTHLY PROGRESS GRID
// ========================================

function createProgressGrid() {

    const grid =
        document.getElementById("github-grid");

    grid.innerHTML = "";


    // Get correct number of days in month
    const daysInMonth =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayBox =
            document.createElement("div");


        dayBox.className = "progress-day";


        // Store day number in element
        dayBox.dataset.day = day;


        // Select a day
        dayBox.addEventListener(
            "click",
            function() {

                selectedDay =
                    Number(dayBox.dataset.day);


                console.log(
                    "Selected day:",
                    selectedDay
                );
            }
        );


        grid.appendChild(dayBox);
    }
}


// ========================================
// 4. UPDATE MONTH TEXT
// ========================================

function updateMonthText() {

    const monthText =
        document.getElementById(
            "current-month"
        );


    const date =
        new Date(
            currentYear,
            currentMonth
        );


    monthText.textContent =
        date.toLocaleString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );
}


// ========================================
// 5. NEXT MONTH
// ========================================

document
    .getElementById("next-month")
    .addEventListener(
        "click",
        function() {

            currentMonth++;

            createProgressGrid();

            updateMonthText();
        }
    );


// ========================================
// 6. PREVIOUS MONTH
// ========================================

document
    .getElementById("previous-month")
    .addEventListener(
        "click",
        function() {

            currentMonth--;

            createProgressGrid();

            updateMonthText();
        }
    );


// ========================================
// 7. SHOW ADD HABIT FORM
// ========================================

const addHabitButton =
    document.getElementById(
        "add-habit-btn"
    );

const habitForm =
    document.getElementById(
        "habit-form"
    );


addHabitButton.addEventListener(
    "click",
    function() {

        // We're creating, not editing
        editingHabitId = null;


        // Clear old form values
        document.getElementById(
            "habit-name"
        ).value = "";

        document.getElementById(
            "habit-description"
        ).value = "";


        habitForm.style.display = "block";
    }
);


// ========================================
// 8. CREATE / UPDATE HABIT
// ========================================

const createHabitButton =
    document.getElementById(
        "create-habit-btn"
    );


createHabitButton.addEventListener(
    "click",
    async function() {

        const nameInput =
            document.getElementById(
                "habit-name"
            );

        const descriptionInput =
            document.getElementById(
                "habit-description"
            );


        const name = nameInput.value;

        const description =
            descriptionInput.value;


        // ====================================
        // CREATE
        // ====================================

        if (editingHabitId === null) {

            const response =
                await fetch(
                    `${API_URL}/habits`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            task: name,
                            description: description
                        })
                    }
                );


            if (response.ok) {

                nameInput.value = "";

                descriptionInput.value = "";

                habitForm.style.display =
                    "none";


                loadHabits();
            }
        }


        // ====================================
        // UPDATE
        // ====================================

        else {

            const response =
                await fetch(
                    `${API_URL}/habits/${editingHabitId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            task: name,
                            description: description
                        })
                    }
                );


            if (response.ok) {

                nameInput.value = "";

                descriptionInput.value = "";

                editingHabitId = null;

                habitForm.style.display =
                    "none";


                loadHabits();
            }
        }
    }
);


// ========================================
// 9. START APPLICATION
// ========================================

loadHabits();

createProgressGrid();

updateMonthText();
displayTodayDate();