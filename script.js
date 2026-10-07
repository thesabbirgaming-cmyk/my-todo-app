/* =========================================================
   TAJIN'S LITTLE WORLD — TODO APP
   Romantic + fully matched to the latest HTML
   ========================================================= */

"use strict";

const STORAGE_KEY = "tajinsLittleWorldTasks";
const THEME_KEY = "tajinsLittleWorldTheme";

let tasks = [];
let currentFilter = "all";
let currentPriority = "all";
let searchTerm = "";
let editingTaskId = null;
let deletingTaskId = null;
let toastTimer = null;

const $ = (id) => document.getElementById(id);

const taskInput = $("taskInput");
const prioritySelect = $("prioritySelect");
const addTaskBtn = $("addTaskBtn");
const themeToggle = $("themeToggle");
const searchInput = $("searchInput");
const clearSearchBtn = $("clearSearchBtn");
const taskList = $("taskList");
const emptyState = $("emptyState");
const clearAllBtn = $("clearAllBtn");

const editModal = $("editModal");
const closeEditModal = $("closeEditModal");
const editTaskInput = $("editTaskInput");
const editPrioritySelect = $("editPrioritySelect");
const cancelEditBtn = $("cancelEditBtn");
const saveEditBtn = $("saveEditBtn");

const deleteModal = $("deleteModal");
const closeDeleteModal = $("closeDeleteModal");
const cancelDeleteBtn = $("cancelDeleteBtn");
const confirmDeleteBtn = $("confirmDeleteBtn");

const toast = $("toast");
const toastIcon = $("toastIcon");
const toastMessage = $("toastMessage");


/* =========================================================
   CREATE UNIQUE ID
   ========================================================= */

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2, 9);
}


/* =========================================================
   SAVE TASKS
   ========================================================= */

function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


/* =========================================================
   LOAD TASKS
   ========================================================= */

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        tasks = Array.isArray(parsed) ? parsed : [];

        tasks = tasks
            .filter(t => t && typeof t === "object")
            .map(t => ({
                id: t.id || createId(),
                text: String(t.text || "").trim(),

                priority: ["high", "medium", "low"]
                    .includes(t.priority)
                    ? t.priority
                    : "medium",

                completed: Boolean(t.completed),

                createdAt:
                    t.createdAt ||
                    new Date().toISOString()
            }))
            .filter(t => t.text);

    } catch (error) {
        console.error(
            "Could not load tasks:",
            error
        );

        tasks = [];
    }
}


/* =========================================================
   ADD TASK
   ========================================================= */

function addTask() {

    const text = taskInput.value.trim();

    if (!text) {

        showToast(
            "আগে একটা task লিখো 💕",
            "💗"
        );

        taskInput.focus();
        return;
    }

    tasks.unshift({

        id: createId(),

        text: text,

        priority:
            prioritySelect.value ||
            "medium",

        completed: false,

        createdAt:
            new Date().toISOString()
    });

    saveTasks();

    taskInput.value = "";

    prioritySelect.value = "medium";

    currentFilter = "all";
    currentPriority = "all";

    searchTerm = "";
    searchInput.value = "";

    render();

    showToast(
        "Task added for Tajin 💕",
        "💗"
    );

    taskInput.focus();
}


/* =========================================================
   TOGGLE TASK
   ========================================================= */

function toggleTask(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;

    task.completed =
        !task.completed;

    saveTasks();

    render();

    showToast(

        task.completed
            ? "Yay! Task complete 🎀"
            : "Task আবার active করা হয়েছে",

        task.completed
            ? "✨"
            : "↺"
    );
}


/* =========================================================
   OPEN EDIT MODAL
   ========================================================= */

function openEdit(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;

    editingTaskId = id;

    editTaskInput.value =
        task.text;

    editPrioritySelect.value =
        task.priority;

    showModal(editModal);

    setTimeout(() => {

        editTaskInput.focus();

    }, 50);
}


/* =========================================================
   SAVE EDITED TASK
   ========================================================= */

function saveEditedTask() {

    if (!editingTaskId)
        return;

    const task =
        tasks.find(
            t => t.id === editingTaskId
        );

    const text =
        editTaskInput.value.trim();

    if (!task) return;

    if (!text) {

        showToast(
            "Task খালি রাখা যাবে না 💕",
            "!"
        );

        editTaskInput.focus();

        return;
    }

    task.text = text;

    task.priority =
        editPrioritySelect.value ||
        "medium";

    saveTasks();

    closeModal(editModal);

    editingTaskId = null;

    render();

    showToast(
        "Task updated successfully 💕",
        "✏️"
    );
}


/* =========================================================
   OPEN DELETE MODAL
   ========================================================= */

function openDelete(id) {

    const task =
        tasks.find(t => t.id === id);

    if (!task) return;

    deletingTaskId = id;

    showModal(deleteModal);
}


/* =========================================================
   DELETE TASK
   ========================================================= */

function deleteTask() {

    if (!deletingTaskId)
        return;

    const deleted =
        tasks.find(
            t => t.id === deletingTaskId
        );

    tasks =
        tasks.filter(
            t => t.id !== deletingTaskId
        );

    saveTasks();

    closeModal(deleteModal);

    deletingTaskId = null;

    render();

    showToast(

        deleted
            ? `"${deleted.text}" deleted`
            : "Task deleted",

        "🗑️"
    );
}


/* =========================================================
   CLEAR ALL TASKS
   ========================================================= */

function clearAllTasks() {

    if (!tasks.length) {

        showToast(
            "Clear করার মতো কোনো task নেই 💗",
            "!"
        );

        return;
    }

    deletingTaskId = "__ALL__";

    showModal(deleteModal);
}


/* =========================================================
   CONFIRM DELETE
   ========================================================= */

function confirmDelete() {

    if (deletingTaskId === "__ALL__") {

        tasks = [];

        saveTasks();

        closeModal(deleteModal);

        deletingTaskId = null;

        render();

        showToast(
            "সব task clear হয়ে গেছে 💕",
            "🗑️"
        );

        return;
    }

    deleteTask();
}


/* =========================================================
   GET VISIBLE TASKS
   ========================================================= */

function getVisibleTasks() {

    return tasks.filter(task => {

        const matchesStatus =

            currentFilter === "all" ||

            (
                currentFilter === "active" &&
                !task.completed
            ) ||

            (
                currentFilter === "completed" &&
                task.completed
            );


        const matchesPriority =

            currentPriority === "all" ||

            task.priority === currentPriority;


        const matchesSearch =

            !searchTerm ||

            task.text
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                );


        return (
            matchesStatus &&
            matchesPriority &&
            matchesSearch
        );
    });
}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function render() {

    renderTasks();

    updateStats();

    updateFilters();

    updateEmptyState();

    updateSearchButton();
}


/* =========================================================
   RENDER TASK LIST
   ========================================================= */

function renderTasks() {

    taskList.innerHTML = "";

    const visible =
        getVisibleTasks();

    visible.forEach(task => {

        taskList.appendChild(
            createTaskElement(task)
        );

    });
}


/* =========================================================
   CREATE TASK ELEMENT
   ========================================================= */

function createTaskElement(task) {

    const article =
        document.createElement("article");

    article.className =
        "task-card" +
        (
            task.completed
                ? " completed"
                : ""
        );


    /* CHECK BUTTON */

    const check =
        document.createElement("button");

    check.type = "button";

    check.className =
        "task-check";

    check.textContent =
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
        () => toggleTask(task.id)
    );


    /* CONTENT */

    const content =
        document.createElement("div");

    content.className =
        "task-content";


    /* TITLE */

    const title =
        document.createElement("span");

    title.className =
        "task-title";

    title.textContent =
        task.text;


    /* META */

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    /* PRIORITY */

    const priority =
        document.createElement("span");

    priority.className =
        `priority-badge ${task.priority}`;

    priority.textContent = {

        high: "💖 High",

        medium: "🌸 Medium",

        low: "🌱 Low"

    }[task.priority] ||
        "🌸 Medium";


    /* DATE */

    const date =
        document.createElement("span");

    date.className =
        "task-date";

    date.textContent =
        "📅 " +
        formatDate(task.createdAt);


    meta.append(
        priority,
        date
    );

    content.append(
        title,
        meta
    );


    /* ACTIONS */

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    /* EDIT */

    const edit =
        document.createElement("button");

    edit.type = "button";

    edit.className =
        "task-action";

    edit.title =
        "Edit task";

    edit.setAttribute(
        "aria-label",
        "Edit task"
    );

    edit.textContent =
        "✏️";

    edit.addEventListener(
        "click",
        () => openEdit(task.id)
    );


    /* DELETE */

    const del =
        document.createElement("button");

    del.type = "button";

    del.className =
        "task-action delete";

    del.title =
        "Delete task";

    del.setAttribute(
        "aria-label",
        "Delete task"
    );

    del.textContent =
        "🗑️";

    del.addEventListener(
        "click",
        () => openDelete(task.id)
    );


    actions.append(
        edit,
        del
    );


    article.append(
        check,
        content,
        actions
    );


    return article;
}


/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            t => t.completed
        ).length;

    const pending =
        total - completed;

    const percent =
        total
            ? Math.round(
                (completed / total) * 100
            )
            : 0;


    $("totalCount").textContent =
        total;

    $("completedCount").textContent =
        completed;

    $("pendingCount").textContent =
        pending;

    $("progressPercent").textContent =
        percent + "%";

    $("progressText").textContent =
        `${completed} of ${total} completed`;

    $("progressFill").style.width =
        percent + "%";


    const resultInfo =
        $("resultCount");

    if (resultInfo) {

        const visible =
            getVisibleTasks().length;

        resultInfo.textContent =
            `${visible} task${
                visible === 1
                    ? ""
                    : "s"
            } shown`;
    }


    const completionMessage =
        $("completionMessage");


    if (completionMessage) {

        if (total === 0) {

            completionMessage.textContent =
                "একটা ছোট task দিয়ে শুরু করি? 💕";

        }

        else if (percent === 100) {

            completionMessage.textContent =
                "Everything is done! Tajin is amazing! 👑💖";

        }

        else if (percent >= 70) {

            completionMessage.textContent =
                "Almost there! Keep going, Tajin! ✨";

        }

        else if (percent > 0) {

            completionMessage.textContent =
                "Little steps, beautiful progress. 🌸";

        }

        else {

            completionMessage.textContent =
                "Your little journey starts here. 💗";

        }
    }
}


/* =========================================================
   UPDATE FILTER BUTTONS
   ========================================================= */

function updateFilters() {

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {

            btn.classList.toggle(

                "active",

                btn.dataset.filter ===
                currentFilter
            );

        });


    document
        .querySelectorAll(".priority-filter-btn")
        .forEach(btn => {

            btn.classList.toggle(

                "active",

                btn.dataset.priority ===
                currentPriority
            );

        });
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function updateEmptyState() {

    const visible =
        getVisibleTasks().length;


    emptyState.style.display =
        visible === 0
            ? "block"
            : "none";


    taskList.style.display =
        visible === 0
            ? "none"
            : "flex";


    const title =
        emptyState.querySelector("h3");

    const text =
        emptyState.querySelector("p");


    if (!title || !text)
        return;


    if (searchTerm) {

        title.textContent =
            "No matching tasks 💭";

        text.textContent =
            "Try another word or clear your search.";

    }

    else if (
        currentFilter === "completed"
    ) {

        title.textContent =
            "No completed tasks yet 🌸";

        text.textContent =
            "Complete a task and it will appear here.";

    }

    else if (
        currentFilter === "active"
    ) {

        title.textContent =
            "All caught up! 🎉";

        text.textContent =
            "There are no active tasks right now.";

    }

    else if (
        currentPriority !== "all"
    ) {

        title.textContent =
            "No tasks in this priority 💕";

        text.textContent =
            "Try another priority filter.";

    }

    else {

        title.textContent =
            "No little tasks yet 💗";

        text.textContent =
            "Add your first task and make today beautiful.";
    }
}


/* =========================================================
   SEARCH BUTTON
   ========================================================= */

function updateSearchButton() {

    clearSearchBtn.classList.toggle(

        "visible",

        Boolean(searchInput.value)
    );
}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearSearch() {

    searchInput.value = "";

    searchTerm = "";

    render();

    searchInput.focus();
}


/* =========================================================
   STATUS FILTER
   ========================================================= */

function setStatusFilter(filter) {

    currentFilter =
        filter;

    render();
}


/* =========================================================
   PRIORITY FILTER
   ========================================================= */

function setPriorityFilter(priority) {

    currentPriority =
        priority;

    render();
}


/* =========================================================
   DATE
   ========================================================= */

function updateDate() {

    const now =
        new Date();

    $("currentDate").textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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
            "Good morning, Tajin! ☀️💕";

    }

    else if (hour < 18) {

        greeting =
            "Good afternoon, Tajin! 🌸💕";

    }

    else {

        greeting =
            "Good evening, Tajin! 🌙💕";
    }


    $("greeting").textContent =
        greeting;
}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );

    const dark =
        saved === "dark";


    document.body.classList.toggle(
        "dark-mode",
        dark
    );


    themeToggle.textContent =
        dark
            ? "☀️"
            : "🌙";


    themeToggle.setAttribute(

        "aria-label",

        dark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


/* =========================================================
   TOGGLE THEME
   ========================================================= */

function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark-mode"
        );


    localStorage.setItem(

        THEME_KEY,

        dark
            ? "dark"
            : "light"
    );


    themeToggle.textContent =
        dark
            ? "☀️"
            : "🌙";


    themeToggle.setAttribute(

        "aria-label",

        dark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    showToast(

        dark
            ? "Dark romantic mode on 🌙"
            : "Light romantic mode on ☀️",

        dark
            ? "🌙"
            : "☀️"
    );
}


/* =========================================================
   SHOW MODAL
   ========================================================= */

function showModal(modal) {

    if (!modal)
        return;

    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(modal) {

    if (!modal)
        return;

    modal.classList.remove(
        "show"
    );


    if (

        !editModal.classList.contains(
            "show"
        )

        &&

        !deleteModal.classList.contains(
            "show"
        )

    ) {

        document.body.style.overflow =
            "";
    }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    icon = "💕"
) {

    clearTimeout(
        toastTimer
    );


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
   EVENTS
   ========================================================= */

function initEvents() {


    /* ADD */

    addTaskBtn.addEventListener(
        "click",
        addTask
    );


    /* THEME */

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );


    /* CLEAR ALL */

    clearAllBtn.addEventListener(
        "click",
        clearAllTasks
    );


    /* ENTER = ADD */

    taskInput.addEventListener(
        "keydown",

        e => {

            if (
                e.key === "Enter"
            ) {

                addTask();
            }
        }
    );


    /* SEARCH */

    searchInput.addEventListener(
        "input",

        () => {

            searchTerm =
                searchInput.value.trim();

            render();
        }
    );


    /* CLEAR SEARCH */

    clearSearchBtn.addEventListener(
        "click",
        clearSearch
    );


    /* STATUS FILTER */

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(btn => {

            btn.addEventListener(

                "click",

                () => {

                    setStatusFilter(
                        btn.dataset.filter
                    );

                }
            );
        });


    /* PRIORITY FILTER */

    document
        .querySelectorAll(
            ".priority-filter-btn"
        )
        .forEach(btn => {

            btn.addEventListener(

                "click",

                () => {

                    setPriorityFilter(
                        btn.dataset.priority
                    );

                }
            );
        });


    /* EDIT CLOSE */

    closeEditModal.addEventListener(

        "click",

        () => {

            editingTaskId = null;

            closeModal(
                editModal
            );
        }
    );


    /* EDIT CANCEL */

    cancelEditBtn.addEventListener(

        "click",

        () => {

            editingTaskId = null;

            closeModal(
                editModal
            );
        }
    );


    /* SAVE EDIT */

    saveEditBtn.addEventListener(

        "click",

        saveEditedTask
    );


    /* EDIT ENTER / ESC */

    editTaskInput.addEventListener(

        "keydown",

        e => {

            if (
                e.key === "Enter"
            ) {

                saveEditedTask();
            }


            if (
                e.key === "Escape"
            ) {

                closeModal(
                    editModal
                );
            }
        }
    );


    /* DELETE CLOSE */

    closeDeleteModal.addEventListener(

        "click",

        () => {

            deletingTaskId = null;

            closeModal(
                deleteModal
            );
        }
    );


    /* DELETE CANCEL */

    cancelDeleteBtn.addEventListener(

        "click",

        () => {

            deletingTaskId = null;

            closeModal(
                deleteModal
            );
        }
    );


    /* CONFIRM DELETE */

    confirmDeleteBtn.addEventListener(

        "click",

        confirmDelete
    );


    /* CLICK OUTSIDE MODAL */

    [
        editModal,
        deleteModal

    ].forEach(modal => {

        modal.addEventListener(

            "click",

            e => {

                if (
                    e.target === modal
                ) {

                    closeModal(
                        modal
                    );

                    editingTaskId =
                        null;

                    deletingTaskId =
                        null;
                }
            }
        );

    });


    /* ESCAPE */

    document.addEventListener(

        "keydown",

        e => {

            if (
                e.key === "Escape"
            ) {

                closeModal(
                    editModal
                );

                closeModal(
                    deleteModal
                );

                editingTaskId =
                    null;

                deletingTaskId =
                    null;
            }
        }
    );
}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function init() {

    loadTasks();

    loadTheme();

    updateDate();

    updateGreeting();

    initEvents();

    render();


    /* Keep date and greeting fresh */

    setInterval(

        () => {

            updateDate();

            updateGreeting();

        },

        60000
    );
}


/* =========================================================
   START APP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);
