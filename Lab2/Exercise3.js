// Counter to give every task a unique ID
let taskCount = 0;

// 1. Function to create a new task
function addTask() {
    const input = document.getElementById("taskInput");
    const taskName = input.value;

    if (taskName === "") {
        alert("Please enter a task name!");
        return;
    }

    // Create the task card div
    const card = document.createElement("div");
    taskCount++; // Increment counter
    card.id = "task-" + taskCount; // Example ID: "task-1"
    card.className = "task-card";
    
    // Add draggable attribute
    card.setAttribute("draggable", "true");
    card.setAttribute("ondragstart", "drag(event)");

    // Add content (Name + Date)
    const date = new Date().toLocaleDateString();
    card.innerHTML = `<strong>${taskName}</strong><br><small>${date}</small>`;

    // Append to "To Do" column by default
    document.getElementById("todo").appendChild(card);

    // Clear input box
    input.value = "";
}

// 2. Allow dropping (Standard HTML5 requirement)
function allowDrop(event) {
    event.preventDefault();
}

// 3. What happens when dragging starts
function drag(event) {
    // Save the ID of the element being dragged
    event.dataTransfer.setData("text", event.target.id);
}

// 4. What happens when dropping
function drop(event) {
    event.preventDefault();
    
    // Get the ID of the dragged item
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    
    // Find the closest column (in case user drops on a header or another task)
    const dropZone = event.target.closest(".column");

    if (dropZone) {
        // Move the element to the new column
        dropZone.appendChild(draggedElement);

        // CHECK: Is it the "Completed" column?
        if (dropZone.id === "completed") {
            draggedElement.classList.add("task-completed");
            // Use setTimeout to allow the visual drop to happen before the alert pops up
            setTimeout(() => alert("Task Completed Successfully"), 100);
        } else {
            // If moved back to ToDo or In Progress, remove the green style
            draggedElement.classList.remove("task-completed");
        }
    }
}