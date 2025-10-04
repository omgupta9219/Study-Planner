// Task data structure stored in memory
let tasks = [];
let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
    updateStats();
    renderTasks();
    setMinDate();
});

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').setAttribute('min', today);
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        subject: document.getElementById('taskSubject').value,
        priority: document.getElementById('taskPriority').value,
        date: document.getElementById('taskDate').value,
        time: document.getElementById('taskTime').value,
        notes: document.getElementById('taskNotes').value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    
    // Reset form
    document.getElementById('taskForm').reset();
    
    // Update UI
    updateStats();
    renderTasks();
    
    // Show notification
    showNotification('Task added successfully! 🎉');
    
    // Set reminder if time is provided
    if (task.time) {
        setReminder(task);
    }
}

// Handle filter button clicks
function handleFilterClick(e) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update filter and render
    currentFilter = e.target.dataset.filter;
    renderTasks();
}

// Render tasks based on current filter
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    
    // Filter tasks
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // Sort by date
    filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Render
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state"><p>No tasks found. 📝</p></div>';
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-complete').forEach(btn => {
        btn.addEventListener('click', () => toggleComplete(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteTask(parseInt(btn.dataset.id)));
    });
}

// Create task card HTML
function createTaskCard(task) {
    const dueDate = new Date(task.date);
    const today = new Date();
    const isOverdue = dueDate < today && !task.completed;
    
    return `
        <div class="task-card ${task.completed ? 'completed' : ''} priority-${task.priority}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    ${!task.completed ? `<button class="task-btn btn-complete" data-id="${task.id}">✓</button>` : ''}
                    <button class="task-btn btn-delete" data-id="${task.id}">✕</button>
                </div>
            </div>
            
            <div class="task-details">
                <div class="task-detail">
                    <strong>Subject:</strong> ${task.subject}
                </div>
                <div class="task-detail">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                </div>
                <div class="task-detail">
                    <strong>Due:</strong> ${formatDate(task.date)}
                    ${isOverdue ? ' ⚠️ <span style="color: #f44336;">Overdue</span>' : ''}
                </div>
                ${task.time ? `<div class="task-detail"><strong>Time:</strong> ${task.time}</div>` : ''}
            </div>
            
            ${task.notes ? `<div class="task-notes"><strong>Notes:</strong> ${task.notes}</div>` : ''}
        </div>
    `;
}

// Toggle task completion
function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateStats();
        renderTasks();
        showNotification(task.completed ? 'Task completed! 🎊' : 'Task reopened!');
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        updateStats();
        renderTasks();
        showNotification('Task deleted!');
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('progressPercent').textContent = progress + '%';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Set reminder (basic implementation)
function setReminder(task) {
    const taskDateTime = new Date(task.date + 'T' + task.time);
    const now = new Date();
    const timeUntilTask = taskDateTime - now;
    
    if (timeUntilTask > 0) {
        setTimeout(() => {
            if (!task.completed) {
                alert(`⏰ Reminder: ${task.title}\nDue today at ${task.time}`);
            }
        }, timeUntilTask);
    }
}

// Save tasks to memory (in a real app, this would use localStorage)
// Note: localStorage is not supported in this environment
function saveTasks() {
    // Tasks are already stored in the global 'tasks' variable
    // In a browser environment, you would use:
    // localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks));
}

// Load tasks from memory
function loadTasks() {
    // In a browser environment, you would use:
    // const saved = localStorage.getItem('studyPlannerTasks');
    // if (saved) {
    //     tasks = JSON.parse(saved);
    // }
    
    // For now, tasks starts as empty array
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);