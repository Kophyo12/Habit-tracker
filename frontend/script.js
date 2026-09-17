const API_URL = "http://127.0.0.1:8000";
let editingHabitId = null;


async function loadHabits() {

    const response = await fetch(`${API_URL}/habits`);
    const habits = await response.json();
    displayHabits(habits)

}


function displayHabits(habits){

    const habitList = document.getElementById("habit-list");

    habitList.innerHTML = "";

    habits.forEach(function(habit) {

        const habitCard = document.createElement("div")

        habitCard.className = "habit-card"

        habitCard.innerHTML = `

        <h2>${habit.task}</h2>

        <p>${habit.description || "No description"}</p>

        <p>Status: ${habit.active ? "Active" : "Inactive"}</p>

        <button class = "delete-btn" data-id="${habit.id}">

        Delete </button>

        <button class = "edit-btn" data-id="${habit.id}">

        Edit </button>

        `

        habitList.appendChild(habitCard)

    })

    delete_buttons = document.querySelectorAll(".delete-btn")

    delete_buttons.forEach(function(button) {

        button.addEventListener("click",async function () {

            const habitId = button.dataset.id

            const response = await fetch(`${API_URL}/habits/${habitId}`,{

                method : "DELETE"

            });

            if (response.ok) {

                loadHabits()

            }   

        });

    })

    edit_buttons = document.querySelectorAll(".edit-btn")

    edit_buttons.forEach(function(button) {

        button.addEventListener("click", async function(){

        const habitId = button.dataset.id
            //editing-vari id 
        editingHabitId = habitId;

        const response = await fetch(`${API_URL}/habits/${habitId}`)

        const habit = await response.json()
        
        const nameInput = document.getElementById("habit-name")
        const descriptionInput = document.getElementById("habit-description")

        nameInput.value = habit.task;
        descriptionInput.value = habit.description || "";


        habitForm.style.display = "block";


    })

});
}



const addHabitButton = document.getElementById("add-habit-btn");

const habitForm = document.getElementById("habit-form");

addHabitButton.addEventListener("click", function() {

    habitForm.style.display = "block";

});



const createHabitButton = document.getElementById("create-habit-btn");

createHabitButton.addEventListener("click", async function() {

    const nameInput = document.getElementById("habit-name")

    const descriptionInput = document.getElementById("habit-description");

    const name = nameInput.value;

    const description = descriptionInput.value

    if (editingHabitId == null) {

    const response = await fetch(`${API_URL}/habits`, {

        method : "POST",

        headers : {

            "Content-Type" : "application/json"

        },

        body : JSON.stringify({

            task : name,

            description : description

        }),

    })

    if (response.ok) {

        nameInput.value = "";

        descriptionInput.value = "";

        habitForm.style.display = "none"

        loadHabits()
    }
    }
    else{
        const response = await fetch(`${API_URL}/habits/${editingHabitId}`, {
                method : "PUT",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    task : name,
                    description : description
                })
        });
        if (response.ok) {
            nameInput.value = "";
            descriptionInput.value = ""
            editingHabitId = null
            habitForm.style.display = "none"
            loadHabits()
        }
    }

});