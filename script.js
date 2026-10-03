/* =========================================================
   MY TODO — PREMIUM V2
   ========================================================= */


/* =========================================================
   DATA
   ========================================================= */

const STORAGE_KEY = "myTodoPremiumTasks";
const THEME_KEY = "myTodoPremiumTheme";


let tasks = [];
let currentFilter = "all";
let currentPriority = "all";
let editingTaskId = null;
let deletingTaskId = null;
let toastTimer = null;


/* =========================================================
   DOM
   ========================================================= */

const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priorityInput");

const addButton =
    document.getElementById("addButton");

const taskList =
    document.getElementById("taskList");

const emptyState =
    document.getElementById("emptyState");

const emptyTitle =
    document.getElementById("emptyTitle");

const emptyText =
    document.getElementById("emptyText");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const themeButton =
    document.getElementById("themeButton");

const themeIcon =
    document.getElementById("themeIcon");

const editModal =
    document.getElementById("editModal");

const confirmModal =
    document.getElementById("confirmModal");

const editTaskInput =
    document.getElementById("editTaskInput");

const editPriorityInput =
    document.getElementById("editPriorityInput");

const saveEditButton =
    document.getElementById("saveEditButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const closeEditButton =
    document.getElementById("closeEditButton");

const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");

const cancelConfirmButton =
    document.getElementById("cancelConfirmButton");

const clearAllButton =
    document.getElementById("clearAllButton");

const emptyAddButton =
    document.getElementById("emptyAddButton");

const toast =
    document.getElementById("toast");

const toastIcon =
    document.getElementById("toastIcon");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   INITIALIZE
   ========================================================= */

function init() {

    loadTasks();

    loadTheme();

    updateDate();

    updateGreeting();

    renderTasks();

    updateStats();

}


/* =========================================================
   STORAGE
   ========================================================= */

function loadTasks() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {

            tasks = [];

            return;

        }

        const parsed =
            JSON.parse(saved);

        if (Array.isArray(parsed)) {

            tasks = parsed;

        } else {

            tasks = [];

        }

    } catch (error) {

        console.error(
            "Could not load tasks:",
            error
        );

        tasks = [];

    }

}


function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );

}


/* =========================================================
   TASK ID
   ========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   ADD TASK
   ========================================================= */

function addTask() {

    const text =
        taskInput.value.trim();

    if (!text) {

        showToast(
            "Please enter a task first.",
            "!"
        );

        taskInput.focus();

        return;

    }


    const newTask = {

        id: createId(),

        text: text,

        priority:
            priorityInput.value || "medium",

        completed: false,

        createdAt:
            new Date().toISOString()

    };


    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    priorityInput.value = "medium";

    currentFilter = "all";

    currentPriority = "all";

    updateFilterButtons();

    renderTasks();

    updateStats();

    showToast(
        "Task added successfully.",
        "✓"
    );

    taskInput.focus();

}


/* =========================================================
   TOGGLE TASK
   ========================================================= */

function toggleTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateStats();


    if (task.completed) {

        showToast(
            "Task completed! 🎉",
            "✓"
        );

    } else {

        showToast(
            "Task moved back to active.",
            "↺"
        );

    }

}


/* =========================================================
   DELETE TASK
   ========================================================= */

function openDeleteModal(id) {

    deletingTaskId = id;

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) return;


    document.getElementById(
        "confirmTitle"
    ).textContent =
        "Delete this task?";


    document.getElementById(
        "confirmText"
    ).textContent =
        `"${task.text}" will be permanently removed.`;


    openModal(confirmModal);

}


function deleteTask() {

    if (!deletingTaskId) return;


    tasks =
        tasks.filter(
            task =>
                task.id !== deletingTaskId
        );


    saveTasks();

    closeModal(confirmModal);

    deletingTaskId = null;

    renderTasks();

    updateStats();

    showToast(
        "Task deleted.",
        "×"
    );

}


/* =========================================================
   CLEAR ALL
   ========================================================= */

function openClearAllModal() {

    if (tasks.length === 0) {

        showToast(
            "There are no tasks to clear.",
            "!"
        );

        return;

    }


    deletingTaskId = "__ALL__";


    document.getElementById(
        "confirmTitle"
    ).textContent =
        "Clear all tasks?";


    document.getElementById(
        "confirmText"
    ).textContent =
        `This will permanently remove all ${tasks.length} tasks.`;


    openModal(confirmModal);

}


function confirmDeleteAction() {

    if (deletingTaskId === "__ALL__") {

        tasks = [];

        saveTasks();

        closeModal(confirmModal);

        deletingTaskId = null;

        renderTasks();

        updateStats();

        showToast(
            "All tasks cleared.",
            "×"
        );

        return;

    }


    deleteTask();

}


/* =========================================================
   EDIT TASK
   ========================================================= */

function openEditModal(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) return;


    editingTaskId = id;

    editTaskInput.value =
        task.text;

    editPriorityInput.value =
        task.priority || "medium";


    openModal(editModal);

    setTimeout(
        () => editTaskInput.focus(),
        100
    );

}


function saveEditedTask() {

    if (!editingTaskId) return;


    const text =
        editTaskInput.value.trim();


    if (!text) {

        showToast(
            "Task cannot be empty.",
            "!"
        );

        editTaskInput.focus();

        return;

    }


    const task =
        tasks.find(
            item =>
                item.id === editingTaskId
        );


    if (!task) return;


    task.text = text;

    task.priority =
        editPriorityInput.value;


    saveTasks();

    closeModal(editModal);

    editingTaskId = null;

    renderTasks();

    updateStats();

    showToast(
        "Task updated successfully.",
        "✓"
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(modal) {

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeModal(modal) {

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        !editModal.classList.contains("show") &&
        !confirmModal.classList.contains("show")
    ) {

        document.body.style.overflow =
            "";

    }

}


/* =========================================================
   FILTER TASKS
   ========================================================= */

function getVisibleTasks() {

    let result =
        [...tasks];


    /* Main filter */

    if (currentFilter === "active") {

        result =
            result.filter(
                task =>
                    !task.completed
            );

    }


    if (currentFilter === "completed") {

        result =
            result.filter(
                task =>
                    task.completed
            );

    }


    /* Priority filter */

    if (currentPriority !== "all") {

        result =
            result.filter(
                task =>
                    task.priority ===
                    currentPriority
            );

    }


    /* Search */

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (search) {

        result =
            result.filter(
                task =>
                    task.text
                        .toLowerCase()
                        .includes(search)
            );

    }


    /* Priority sorting */

    const priorityOrder = {

        high: 1,
        medium: 2,
        low: 3

    };


    result.sort(
        (a, b) => {

            /* Active before completed */

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed
                    ? 1
                    : -1;

            }


            /* High priority first */

            const priorityDifference =
                (
                    priorityOrder[
                        a.priority
                    ] || 3
                ) -
                (
                    priorityOrder[
                        b.priority
                    ] || 3
                );


            if (
                priorityDifference !== 0
            ) {

                return priorityDifference;

            }


            /* Newest first */

            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );

        }
    );


    return result;

}


/* =========================================================
   RENDER
   ========================================================= */

function renderTasks() {

    const visibleTasks =
        getVisibleTasks();


    taskList.innerHTML = "";


    if (visibleTasks.length === 0) {

        taskList.style.display =
            "none";

        emptyState.style.display =
            "block";


        updateEmptyState();

        return;

    }


    taskList.style.display =
        "flex";

    emptyState.style.display =
        "none";


    visibleTasks.forEach(
        task => {

            taskList.appendChild(
                createTaskElement(task)
            );

        }
    );

}


/* =========================================================
   CREATE TASK ELEMENT
   ========================================================= */

function createTaskElement(task) {

    const article =
        document.createElement("article");


    article.className =
        "task-card";


    if (task.completed) {

        article.classList.add(
            "completed"
        );

    }


    /* Check */

    const check =
        document.createElement("button");

    check.className =
        "task-check";

    check.type =
        "button";

    check.innerHTML =
        task.completed
            ? "✓"
            : "";


    check.setAttribute(
        "aria-label",
        task.completed
            ? "Mark as active"
            : "Mark as completed"
    );


    check.addEventListener(
        "click",
        () =>
            toggleTask(task.id)
    );


    /* Content */

    const content =
        document.createElement("div");

    content.className =
        "task-content";


    const title =
        document.createElement("span");

    title.className =
        "task-title";

    title.textContent =
        task.text;


    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    /* Priority */

    const priority =
        document.createElement("span");

    priority.className =
        `priority-badge ${task.priority}`;


    const priorityNames = {

        high: "🔴 High",
        medium: "🟡 Medium",
        low: "🟢 Low"

    };


    priority.textContent =
        priorityNames[
            task.priority
        ] || "🟡 Medium";


    /* Date */

    const date =
        document.createElement("span");

    date.className =
        "task-date";

    date.textContent =
        "📅 " +
        formatDate(task.createdAt);


    meta.appendChild(priority);
    meta.appendChild(date);


    content.appendChild(title);
    content.appendChild(meta);


    /* Actions */

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    const edit =
        document.createElement("button");

    edit.className =
        "task-action";

    edit.type =
        "button";

    edit.title =
        "Edit task";

    edit.textContent =
        "✎";


    edit.addEventListener(
        "click",
        () =>
            openEditModal(task.id)
    );


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "task-action delete";

    deleteButton.type =
        "button";

    deleteButton.title =
        "Delete task";

    deleteButton.textContent =
        "×";


    deleteButton.addEventListener(
        "click",
        () =>
            openDeleteModal(task.id)
    );


    actions.appendChild(edit);
    actions.appendChild(deleteButton);


    article.appendChild(check);
    article.appendChild(content);
    article.appendChild(actions);


    return article;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function updateEmptyState() {

    const hasTasks =
        tasks.length > 0;


    const search =
        searchInput.value.trim();


    if (search) {

        emptyTitle.textContent =
            "No matching tasks";

        emptyText.textContent =
            "Try another search term or clear the search.";

        emptyAddButton.style.display =
            "none";

        return;

    }


    if (
        currentFilter === "completed"
    ) {

        emptyTitle.textContent =
            "No completed tasks";

        emptyText.textContent =
            "Complete a task and it will appear here.";

        emptyAddButton.style.display =
            "none";

        return;

    }


    if (
        currentFilter === "active"
    ) {

        emptyTitle.textContent =
            "All caught up! 🎉";

        emptyText.textContent =
            "You don't have any active tasks right now.";

        emptyAddButton.style.display =
            "inline-flex";

        return;

    }


    if (
        currentPriority !== "all"
    ) {

        emptyTitle.textContent =
            "No tasks in this priority";

        emptyText.textContent =
            "Try another priority filter.";

        emptyAddButton.style.display =
            "none";

        return;

    }


    if (!hasTasks) {

        emptyTitle.textContent =
            "No tasks yet";

        emptyText.textContent =
            "Add your first task and start making progress.";

        emptyAddButton.style.display =
            "inline-flex";

    }

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    document.getElementById(
        "totalCount"
    ).textContent =
        total;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;


    document.getElementById(
        "percentageCount"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "allFilterCount"
    ).textContent =
        total;


    document.getElementById(
        "progressPercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "progressLabel"
    ).textContent =
        `${completed} of ${total} completed`;


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage + "%";

}


/* =========================================================
   FILTER BUTTONS
   ========================================================= */

function updateFilterButtons() {

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                    currentFilter
                );

            }
        );


    document
        .querySelectorAll(
            ".priority-filter"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.priority ===
                    currentPriority
                );

            }
        );

}


/* =========================================================
   SEARCH
   ========================================================= */

function updateSearchButton() {

    if (searchInput.value) {

        clearSearch.classList.add(
            "visible"
        );

    } else {

        clearSearch.classList.remove(
            "visible"
        );

    }

}


/* =========================================================
   DATE
   ========================================================= */

function updateDate() {

    const now =
        new Date();


    const formatted =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );


    document.getElementById(
        "todayDate"
    ).textContent =
        formatted;

}


function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {

        return "Unknown date";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   GREETING
   ========================================================= */

function updateGreeting() {

    const hour =
        new Date().getHours();


    let greeting;


    if (hour < 12) {

        greeting =
            "Good morning ☀️";

    } else if (hour < 18) {

        greeting =
            "Good afternoon 🌤️";

    } else {

        greeting =
            "Good evening 🌙";

    }


    document.getElementById(
        "greetingTitle"
    ).textContent =
        greeting;

}


/* =========================================================
   THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeIcon.textContent =
            "☀";

    } else {

        themeIcon.textContent =
            "☾";

    }

}


function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        dark ? "dark" : "light"
    );


    themeIcon.textContent =
        dark ? "☀" : "☾";


    showToast(
        dark
            ? "Dark mode enabled."
            : "Light mode enabled.",
        dark ? "☀" : "☾"
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    icon = "✓"
) {

    clearTimeout(toastTimer);


    toastMessage.textContent =
        message;

    toastIcon.textContent =
        icon;


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */


/* Add */

addButton.addEventListener(
    "click",
    addTask
);


/* Enter */

taskInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            addTask();

        }

    }
);


/* Search */

searchInput.addEventListener(
    "input",
    () => {

        updateSearchButton();

        renderTasks();

    }
);


/* Clear search */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        updateSearchButton();

        renderTasks();

        searchInput.focus();

    }
);


/* Main filters */

document
    .querySelectorAll(
        ".filter-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentFilter =
                        button.dataset.filter;

                    updateFilterButtons();

                    renderTasks();

                }
            );

        }
    );


/* Priority filters */

document
    .querySelectorAll(
        ".priority-filter"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentPriority =
                        button.dataset.priority;

                    updateFilterButtons();

                    renderTasks();

                }
            );

        }
    );


/* Theme */

themeButton.addEventListener(
    "click",
    toggleTheme
);


/* Clear all */

clearAllButton.addEventListener(
    "click",
    openClearAllModal
);


/* Empty state */

emptyAddButton.addEventListener(
    "click",
    () => {

        taskInput.focus();

        taskInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);


/* Edit */

saveEditButton.addEventListener(
    "click",
    saveEditedTask
);


cancelEditButton.addEventListener(
    "click",
    () => {

        editingTaskId = null;

        closeModal(editModal);

    }
);


closeEditButton.addEventListener(
    "click",
    () => {

        editingTaskId = null;

        closeModal(editModal);

    }
);


/* Edit Enter */

editTaskInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            saveEditedTask();

        }


        if (
            event.key === "Escape"
        ) {

            closeModal(editModal);

        }

    }
);


/* Delete confirmation */

confirmDeleteButton.addEventListener(
    "click",
    confirmDeleteAction
);


cancelConfirmButton.addEventListener(
    "click",
    () => {

        deletingTaskId = null;

        closeModal(confirmModal);

    }
);


/* Modal background */

document
    .querySelectorAll(
        ".modal-backdrop"
    )
    .forEach(
        backdrop => {

            backdrop.addEventListener(
                "click",
                () => {

                    closeModal(
                        backdrop.parentElement
                    );

                }
            );

        }
    );


/* Escape */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        if (
            editModal.classList.contains(
                "show"
            )
        ) {

            closeModal(editModal);

        }


        if (
            confirmModal.classList.contains(
                "show"
            )
        ) {

            closeModal(confirmModal);

        }

    }
);


/* =========================================================
   START APP
   ========================================================= */

init();