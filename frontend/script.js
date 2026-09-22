const API_URL = "http://127.0.0.1:8000";


// ========================================
// APPLICATION STATE
// ========================================

let today = new Date();

let currentYear =
    today.getFullYear();

let currentMonth =
    today.getMonth();

let selectedDay =
    today.getDate();

function isViewingToday() {
    today = new Date();
    return currentYear === today.getFullYear()
        && currentMonth === today.getMonth();
}


let editingHabitId = null;


// Habits currently returned by backend
let currentHabits = [];


// Completion data for current month.
//
// Example:
//
// {
//     "2026-09-22": ["1", "3"],
//     "2026-09-23": ["2"]
// }
//
let completions = {};
let progressByDate = {};
let monthRequest = 0;


// ========================================
// DATE KEY
// ========================================

function getDateKey(day) {

    const month =
        String(
            currentMonth + 1
        ).padStart(
            2,
            "0"
        );


    const formattedDay =
        String(day).padStart(
            2,
            "0"
        );


    return (
        `${currentYear}-${month}-${formattedDay}`
    );
}


// ========================================
// LOAD HABITS
// ========================================

async function loadHabits() {

    const response =
        await fetch(
            `${API_URL}/habits`
        );


    if (!response.ok) {

        console.error(
            "Could not load habits"
        );

        return;
    }


    currentHabits =
        await response.json();


    displayHabits();
}


// ========================================
// DISPLAY HABITS
// ========================================

function displayHabits() {

    const habitTracker =
        document.getElementById(
            "habit-tracker"
        );


    habitTracker.innerHTML = "";

    if (currentHabits.length === 0) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = "No habits yet. Add one below.";
        habitTracker.appendChild(emptyState);
    }


    currentHabits.forEach(
        function(habit) {


            // -------------------------
            // CREATE ROW
            // -------------------------

            const habitRow =
                document.createElement(
                    "div"
                );


            habitRow.className =
                "habit-row";


            habitRow.dataset.habitId =
                habit.id;


            habitRow.innerHTML = `

                <div class="habit-name">

                    <button class="habit-check" type="button">
                        □
                    </button>

                    <span class="habit-title">
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


            // -------------------------
            // GET ELEMENTS
            // -------------------------

            const checkBox =
                habitRow.querySelector(
                    ".habit-check"
                );

            checkBox.disabled = !isViewingToday();
            checkBox.setAttribute("aria-label", `Toggle ${habit.task}`);

            const habitTitle =
                habitRow.querySelector(
                    ".habit-title"
                );

            habitTitle.textContent = habit.task;


            const editButton =
                habitRow.querySelector(
                    ".edit-btn"
                );


            const deleteButton =
                habitRow.querySelector(
                    ".delete-btn"
                );


            // -------------------------
            // CHECK / UNCHECK
            // -------------------------

            checkBox.addEventListener(
                "click",

                async function() {

                    if (!isViewingToday()) return;

                    const dateKey = getDateKey(today.getDate());


                    const response =
                        await fetch(

                            `${API_URL}/habits/${habit.id}/complete`,

                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        date:
                                            dateKey
                                    })
                            }
                        );


                    if (!response.ok) {

                        console.error(
                            "Could not update completion"
                        );

                        return;
                    }


                    const result =
                        await response.json();


                    updateLocalCompletion(
                        habit.id,
                        dateKey,
                        result.completed
                    );


                    updateHabitCheckboxes();


                    await loadProgress();
                }
            );


            // -------------------------
            // EDIT
            // -------------------------

            editButton.addEventListener(
                "click",

                function() {

                    editingHabitId =
                        habit.id;


                    document
                        .getElementById(
                            "habit-name"
                        )
                        .value =
                            habit.task;


                    document
                        .getElementById(
                            "habit-description"
                        )
                        .value =
                            habit.description
                            || "";


                    showHabitForm();
                }
            );


            // -------------------------
            // DELETE
            // -------------------------

            deleteButton.addEventListener(
                "click",

                async function() {

                    const response =
                        await fetch(

                            `${API_URL}/habits/${habit.id}`,

                            {
                                method:
                                    "DELETE"
                            }
                        );


                    if (!response.ok) {

                        console.error(
                            "Could not delete habit"
                        );

                        return;
                    }


                    currentHabits =
                        currentHabits.filter(
                            function(item) {

                                return (
                                    item.id
                                    !== habit.id
                                );
                            }
                        );


                    if (editingHabitId === habit.id) hideHabitForm();

                    displayHabits();
                    await loadProgress();
                }
            );


            habitTracker.appendChild(
                habitRow
            );
        }
    );


    updateHabitCheckboxes();
}


// ========================================
// UPDATE LOCAL COMPLETION
// ========================================

function updateLocalCompletion(
    habitId,
    dateKey,
    completed
) {

    const stringHabitId =
        String(habitId);


    if (!completions[dateKey]) {

        completions[dateKey] = [];
    }


    if (completed) {

        if (
            !completions[dateKey]
                .includes(
                    stringHabitId
                )
        ) {

            completions[dateKey]
                .push(
                    stringHabitId
                );
        }

    } else {

        completions[dateKey] =
            completions[dateKey]
                .filter(
                    function(id) {

                        return (
                            id
                            !== stringHabitId
                        );
                    }
                );
    }
}


// ========================================
// UPDATE CHECKBOX APPEARANCE
// ========================================

function updateHabitCheckboxes() {

    selectedDay = isViewingToday() ? today.getDate() : 1;
    updateSelectedDay();

    const dateKey =
        getDateKey(
            selectedDay
        );


    const completedIds =
        completions[dateKey]
        || [];


    const habitRows =
        document.querySelectorAll(
            ".habit-row"
        );


    habitRows.forEach(
        function(habitRow) {

            const habitId =
                habitRow.dataset.habitId;


            const checkBox =
                habitRow.querySelector(
                    ".habit-check"
                );


            const habitTitle =
                habitRow.querySelector(
                    ".habit-title"
                );


            if (
                completedIds.includes(
                    habitId
                )
            ) {

                checkBox.textContent =
                    "✓";

                checkBox.setAttribute("aria-pressed", "true");


                habitTitle.style
                    .textDecoration =
                        "line-through";

            } else {

                checkBox.textContent =
                    "□";

                checkBox.setAttribute("aria-pressed", "false");


                habitTitle.style
                    .textDecoration =
                        "none";
            }
        }
    );
}


// ========================================
// LOAD COMPLETIONS FROM DATABASE
// ========================================

async function loadCompletions(requestId = monthRequest) {

    const databaseMonth =
        currentMonth + 1;


    const response =
        await fetch(

            `${API_URL}/completions?year=${currentYear}&month=${databaseMonth}`

        );


    if (!response.ok) {

        console.error(
            "Could not load completions"
        );

        return;
    }


    const databaseCompletions =
        await response.json();

    if (requestId !== monthRequest) return;


    completions = {};


    databaseCompletions.forEach(
        function(completion) {

            const dateKey =
                completion.date;


            if (!completions[dateKey]) {

                completions[dateKey] = [];
            }


            completions[dateKey].push(
                String(
                    completion.habit_id
                )
            );
        }
    );


    updateHabitCheckboxes();


    await loadProgress(requestId);
}


async function loadProgress(requestId = monthRequest) {
    const year = currentYear;
    const month = currentMonth + 1;
    const response = await fetch(
        `${API_URL}/progress?year=${year}&month=${month}`
    );

    if (!response.ok) {
        console.error("Could not load progress");
        return;
    }

    const progress = await response.json();
    if (requestId !== monthRequest || year !== currentYear || month !== currentMonth + 1) return;

    progressByDate = progress;
    updateAllProgress();
}


// ========================================
// PROGRESS FOR ONE DAY
// ========================================

function updateProgress(day) {

    const dateKey =
        getDateKey(day);


    const completedHabits = progressByDate[dateKey]?.completed || 0;
    const totalHabits = progressByDate[dateKey]?.total || 0;


    let completionRate = 0;


    if (totalHabits > 0) {

        completionRate =
            completedHabits
            / totalHabits;
    }


    const dayBox =
        document.querySelector(

            `.progress-day[data-day="${day}"]`

        );


    if (!dayBox) {
        return;
    }


    dayBox.classList.remove(
        "level-1",
        "level-2",
        "level-3",
        "level-4"
    );


    if (completionRate === 0) {
        return;
    }


    if (completionRate <= 0.25) {

        dayBox.classList.add(
            "level-1"
        );

    }

    else if (
        completionRate <= 0.50
    ) {

        dayBox.classList.add(
            "level-2"
        );

    }

    else if (
        completionRate <= 0.75
    ) {

        dayBox.classList.add(
            "level-3"
        );

    }

    else {

        dayBox.classList.add(
            "level-4"
        );
    }
}


// ========================================
// UPDATE EVERY PROGRESS BOX
// ========================================

function updateAllProgress() {

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

        updateProgress(day);
    }
}


// ========================================
// CREATE GITHUB GRID
// ========================================

function createProgressGrid() {

    const grid =
        document.getElementById(
            "github-grid"
        );


    grid.innerHTML = "";


    // How many days are in month?
    const daysInMonth =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    // ====================================
    // REAL DAYS
    // ====================================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayBox =
            document.createElement(
                "div"
            );


        dayBox.className =
            "progress-day";


        dayBox.dataset.day =
            day;


        // -------------------------
        // TODAY
        // -------------------------

        if (
            currentYear
                === today.getFullYear()

            &&

            currentMonth
                === today.getMonth()

            &&

            day
                === today.getDate()
        ) {

            dayBox.classList.add(
                "today"
            );
        }


        // -------------------------
        // SELECTED DAY
        // -------------------------

        if (
            day === selectedDay
        ) {

            dayBox.classList.add(
                "selected"
            );
        }


        grid.appendChild(
            dayBox
        );
    }


    updateAllProgress();
}


// ========================================
// SELECTED DAY VISUAL
// ========================================

function updateSelectedDay() {

    const allDays =
        document.querySelectorAll(
            ".progress-day"
        );


    allDays.forEach(
        function(dayBox) {

            dayBox.classList.remove(
                "selected"
            );
        }
    );


    const selectedBox =
        document.querySelector(

            `.progress-day[data-day="${selectedDay}"]`

        );


    if (selectedBox) {

        selectedBox.classList.add(
            "selected"
        );
    }
}


// ========================================
// DISPLAY TODAY
// ========================================

function displayTodayDate() {

    const todayDate =
        document.getElementById(
            "today-date"
        );


    todayDate.textContent =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
}


// ========================================
// MONTH TITLE
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
// CHANGE MONTH
// ========================================

async function changeMonth(
    direction
) {

    const requestId = ++monthRequest;

    currentMonth += direction;


    // December -> January
    if (currentMonth > 11) {

        currentMonth = 0;

        currentYear++;
    }


    // January -> December
    if (currentMonth < 0) {

        currentMonth = 11;

        currentYear--;
    }


    // If viewing current month,
    // select today.

    if (
        currentYear
            === today.getFullYear()

        &&

        currentMonth
            === today.getMonth()
    ) {

        selectedDay =
            today.getDate();

    } else {

        selectedDay = 1;
    }


    updateMonthText();


    createProgressGrid();

    progressByDate = {};


    await loadCompletions(requestId);
}


// ========================================
// NEXT MONTH
// ========================================

document
    .getElementById(
        "next-month"
    )
    .addEventListener(
        "click",
        function() {

            changeMonth(1);
        }
    );


// ========================================
// PREVIOUS MONTH
// ========================================

document
    .getElementById(
        "previous-month"
    )
    .addEventListener(
        "click",
        function() {

            changeMonth(-1);
        }
    );


// ========================================
// HABIT FORM
// ========================================

function showHabitForm() {
    document.getElementById("create-habit-btn").textContent = "Save Changes";
    document.getElementById("cancel-habit-btn").style.display = "inline-block";
    document.getElementById("habit-name").focus();
}

function hideHabitForm() {
    editingHabitId = null;
    document.getElementById("habit-name").value = "";
    document.getElementById("habit-description").value = "";
    document.getElementById("create-habit-btn").textContent = "Add Habit";
    document.getElementById("cancel-habit-btn").style.display = "none";
    document.getElementById("habit-message").textContent = "";
}

function showHabitError(message) {
    document.getElementById("habit-message").textContent = message;
}

document.getElementById("cancel-habit-btn").addEventListener("click", hideHabitForm);


// ========================================
// CREATE / UPDATE HABIT
// ========================================

const createHabitButton =
    document.getElementById(
        "create-habit-btn"
    );


createHabitButton.addEventListener(
    "click",

    async function() {

        showHabitError("");

        const nameInput =
            document.getElementById(
                "habit-name"
            );


        const descriptionInput =
            document.getElementById(
                "habit-description"
            );


        const name =
            nameInput.value.trim();


        const description =
            descriptionInput.value.trim();


        if (!name) {
            showHabitError("Enter a habit name first.");
            nameInput.focus();
            return;
        }


        // =================================
        // CREATE
        // =================================

        if (
            editingHabitId === null
        ) {

            let response;
            try {
                response = await fetch(

                    `${API_URL}/habits`,

                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                task:
                                    name,

                                description:
                                    description
                            })
                    }
                );
            } catch (error) {
                showHabitError("Could not connect to the server. Please try again.");
                return;
            }


            if (!response.ok) {
                console.error("Could not create habit");
                showHabitError("Could not add the habit. Please try again.");
                return;
            }

            const newHabit = await response.json();
            currentHabits.push(newHabit);
        }


        // =================================
        // UPDATE
        // =================================

        else {

            let response;
            try {
                response = await fetch(

                    `${API_URL}/habits/${editingHabitId}`,

                    {
                        method:
                            "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                task:
                                    name,

                                description:
                                    description
                            })
                    }
                );
            } catch (error) {
                showHabitError("Could not connect to the server. Please try again.");
                return;
            }


            if (!response.ok) {
                console.error("Could not update habit");
                showHabitError("Could not save changes. Please try again.");
                return;
            }

            const updatedHabit = await response.json();

            const index = currentHabits.findIndex(
                habit => habit.id === updatedHabit.id
            );

            if (index !== -1) {
                currentHabits[index] = updatedHabit;
            }

        }


        hideHabitForm();


        displayHabits();


        await loadProgress();
    }
);


// ========================================
// START APPLICATION
// ========================================

async function startApplication() {

    displayTodayDate();

    updateMonthText();

    createProgressGrid();

    await loadHabits();

    await loadCompletions();
}


startApplication();
