const API_URL = "http://127.0.0.1:8000";


// ========================================
// APPLICATION STATE
// ========================================

const today = new Date();

let currentYear =
    today.getFullYear();

let currentMonth =
    today.getMonth();

let selectedDay =
    today.getDate();


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

                    <span class="habit-check">
                        □
                    </span>

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


            // -------------------------
            // GET ELEMENTS
            // -------------------------

            const checkBox =
                habitRow.querySelector(
                    ".habit-check"
                );


            const habitTitle =
                habitRow.querySelector(
                    ".habit-title"
                );


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

                    const dateKey =
                        getDateKey(
                            selectedDay
                        );


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


                    updateProgress(
                        selectedDay
                    );
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


                    document
                        .getElementById(
                            "habit-form"
                        )
                        .style.display =
                            "block";
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


                    removeHabitFromCompletions(
                        habit.id
                    );


                    displayHabits();


                    updateAllProgress();
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
// REMOVE DELETED HABIT FROM LOCAL DATA
// ========================================

function removeHabitFromCompletions(
    habitId
) {

    const stringHabitId =
        String(habitId);


    for (
        const dateKey
        in completions
    ) {

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


                habitTitle.style
                    .textDecoration =
                        "line-through";

            } else {

                checkBox.textContent =
                    "□";


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

async function loadCompletions() {

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


    updateAllProgress();
}


// ========================================
// PROGRESS FOR ONE DAY
// ========================================

function updateProgress(day) {

    const dateKey =
        getDateKey(day);


    const completedHabits =
        completions[dateKey]
            ?.length
        || 0;


    const totalHabits =
        currentHabits.length;


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


    // Which weekday is day 1?
    //
    // 0 Sunday
    // 1 Monday
    // ...
    // 6 Saturday

    const firstWeekday =
        new Date(
            currentYear,
            currentMonth,
            1
        ).getDay();


    // ====================================
    // EMPTY CELLS BEFORE DAY 1
    // ====================================

    for (
        let i = 0;
        i < firstWeekday;
        i++
    ) {

        const emptyBox =
            document.createElement(
                "div"
            );


        emptyBox.className =
            "progress-empty";


        grid.appendChild(
            emptyBox
        );
    }


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


        // -------------------------
        // CLICK DAY
        // -------------------------

        dayBox.addEventListener(
            "click",

            function() {

                selectedDay =
                    Number(
                        dayBox.dataset.day
                    );


                updateSelectedDay();


                updateHabitCheckboxes();
            }
        );


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


    await loadCompletions();
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
// ADD HABIT BUTTON
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

        editingHabitId = null;


        document
            .getElementById(
                "habit-name"
            )
            .value = "";


        document
            .getElementById(
                "habit-description"
            )
            .value = "";


        habitForm.style.display =
            "block";
    }
);


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
            return;
        }


        // =================================
        // CREATE
        // =================================

        if (
            editingHabitId === null
        ) {

            const response =
                await fetch(

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


            if (response.ok) {

                const newHabit =
                    await response.json();


                currentHabits.push(
                    newHabit
                );
            }
        }


        // =================================
        // UPDATE
        // =================================

        else {

            const response =
                await fetch(

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


            if (response.ok) {

                const updatedHabit =
                    await response.json();


                const index =
                    currentHabits.findIndex(
                        function(habit) {

                            return (
                                habit.id
                                === updatedHabit.id
                            );
                        }
                    );


                if (index !== -1) {

                    currentHabits[index] =
                        updatedHabit;
                }
            }


            editingHabitId = null;
        }


        // Clear form

        nameInput.value = "";

        descriptionInput.value = "";

        habitForm.style.display =
            "none";


        displayHabits();


        updateAllProgress();
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