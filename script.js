class HabitTracker {
    constructor() {
        this.currentDay = 1;
        this.daysCompleted = 0;
        this.currentStreak = 0;
        this.habitHistory = this.loadHabitHistory();
        this.createGrid();
        this.loadProgress();
        this.initializeEventListeners();
        this.updateUI();
        this.kindnessHistory = this.loadKindnessHistory();
        this.initializeModal();
        this.pictureHistory = this.loadPictureHistory();
        this.initializePictureModal();
        this.bibleHistory = this.loadBibleHistory();
        this.initializeBibleModal();
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('habitProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.currentDay = progress.currentDay;
            this.daysCompleted = progress.daysCompleted;
            this.currentStreak = progress.currentStreak;
        }
    }

    saveProgress() {
        const progress = {
            currentDay: this.currentDay,
            daysCompleted: this.daysCompleted,
            currentStreak: this.currentStreak
        };
        localStorage.setItem('habitProgress', JSON.stringify(progress));
    }

    initializeEventListeners() {
        document.getElementById('completeDay').addEventListener('click', () => this.completeDay());
        
        // Add event listener for kindness checkbox
        document.getElementById('kindness').addEventListener('change', (e) => {
            const kindnessInput = document.querySelector('.kindness-input');
            if (e.target.checked) {
                kindnessInput.classList.add('visible');
                document.getElementById('kindnessText').focus();
            } else {
                kindnessInput.classList.remove('visible');
                document.getElementById('kindnessText').value = '';
            }
        });

        // Add picture checkbox handler
        document.getElementById('picture').addEventListener('change', (e) => {
            const pictureInput = document.querySelector('.picture-input');
            if (e.target.checked) {
                pictureInput.classList.add('visible');
            } else {
                pictureInput.classList.remove('visible');
                document.getElementById('pictureFile').value = ''; // Clear the file input
            }
        });

        // Add click handler for the upload text
        document.querySelector('.upload-text').addEventListener('click', () => {
            document.getElementById('pictureFile').click();
        });

        // Add file input change handler
        document.getElementById('pictureFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    document.querySelector('.upload-text').textContent = `Selected: ${file.name}`;
                    // Store the image data temporarily until the day is completed
                    this.tempImageData = imageData;
                };
                reader.readAsDataURL(file);
            }
        });

        // Add Bible checkbox handler
        document.getElementById('bible').addEventListener('change', (e) => {
            const bibleInput = document.querySelector('.bible-input');
            if (e.target.checked) {
                bibleInput.classList.add('visible');
                document.getElementById('bibleText').focus();
            } else {
                bibleInput.classList.remove('visible');
                document.getElementById('bibleText').value = '';
            }
        });
    }

    updateUI() {
        document.getElementById('currentDay').textContent = this.currentDay;
        document.getElementById('daysCompleted').textContent = this.daysCompleted;
        document.getElementById('currentStreak').textContent = this.currentStreak;
        document.getElementById('progressFill').style.width = `${(this.currentDay - 1) / 90 * 100}%`;
    }

    loadHabitHistory() {
        const savedHistory = localStorage.getItem('habitHistory');
        return savedHistory ? JSON.parse(savedHistory) : Array(90).fill().map(() => Array(9).fill(false));
    }

    saveHabitHistory() {
        localStorage.setItem('habitHistory', JSON.stringify(this.habitHistory));
    }

    createGrid() {
        const gridContainer = document.getElementById('gridSquares');
        gridContainer.innerHTML = '';

        for (let day = 0; day < 90; day++) {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day + 1;
            dayColumn.appendChild(dayNumber);
            
            for (let habit = 0; habit < 9; habit++) {
                const square = document.createElement('div');
                square.className = 'square';
                if (this.habitHistory[day][habit]) {
                    square.classList.add('completed');
                }
                dayColumn.appendChild(square);
            }
            
            gridContainer.appendChild(dayColumn);
        }
    }

    completeDay() {
        const allChecked = Array.from(document.querySelectorAll('.habit-item input[type="checkbox"]'))
            .every(checkbox => checkbox.checked);

        if (allChecked) {
            if (this.currentDay <= 90) {
                // Save Bible text
                const bibleText = document.getElementById('bibleText').value;
                if (bibleText.trim()) {
                    this.bibleHistory[new Date().toISOString()] = bibleText;
                    this.saveBibleHistory();
                }

                // Save kindness text
                const kindnessText = document.getElementById('kindnessText').value;
                if (kindnessText.trim()) {
                    this.kindnessHistory[new Date().toISOString()] = kindnessText;
                    this.saveKindnessHistory();
                }

                if (this.tempImageData) {
                    this.pictureHistory[new Date().toISOString()] = this.tempImageData;
                    this.savePictureHistory();
                    this.tempImageData = null;
                }

                const dayIndex = this.currentDay - 1;
                document.querySelectorAll('.habit-item input[type="checkbox"]').forEach((checkbox, index) => {
                    this.habitHistory[dayIndex][index] = checkbox.checked;
                });
                
                this.daysCompleted++;
                this.currentStreak++;
                this.currentDay++;
                this.saveProgress();
                this.saveHabitHistory();
                this.updateUI();
                this.createGrid();
                this.resetCheckboxes();
                
                if (this.currentDay > 90) {
                    this.showCompletionMessage('Congratulations! You\'ve completed the 90-day challenge! 🎉');
                } else {
                    this.showCompletionMessage(`Day ${dayIndex + 1} out of 90 complete! Keep it up! 💪`);
                }

                document.getElementById('bibleText').value = '';
                document.getElementById('kindnessText').value = '';
                document.getElementById('pictureFile').value = '';
                document.querySelector('.upload-text').textContent = 'Click to upload your daily picture';
            }
        } else {
            alert('Please complete all habits before marking the day as complete.');
        }
    }

    resetCheckboxes() {
        document.querySelectorAll('.habit-item input[type="checkbox"]')
            .forEach(checkbox => checkbox.checked = false);
    }

    loadKindnessHistory() {
        const savedHistory = localStorage.getItem('kindnessHistory');
        return savedHistory ? JSON.parse(savedHistory) : {};
    }

    saveKindnessHistory() {
        localStorage.setItem('kindnessHistory', JSON.stringify(this.kindnessHistory));
    }

    initializeModal() {
        const modal = document.getElementById('journalModal');
        const closeBtn = document.querySelector('.close');
        const journalLabel = document.querySelector('.grid-labels .label:nth-child(4)');
        
        journalLabel.classList.add('clickable');
        
        journalLabel.addEventListener('click', () => {
            this.showKindnessHistory();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showKindnessHistory() {
        const entriesContainer = document.getElementById('kindnessEntries');
        entriesContainer.innerHTML = '';
        
        Object.entries(this.kindnessHistory)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .forEach(([date, text]) => {
                const entry = document.createElement('div');
                entry.className = 'kindness-entry';
                entry.innerHTML = `
                    <div class="date">${new Date(date).toLocaleDateString()}</div>
                    <div class="text">${text}</div>
                `;
                entriesContainer.appendChild(entry);
            });
    }

    loadPictureHistory() {
        const savedHistory = localStorage.getItem('pictureHistory');
        return savedHistory ? JSON.parse(savedHistory) : {};
    }

    savePictureHistory() {
        localStorage.setItem('pictureHistory', JSON.stringify(this.pictureHistory));
    }

    initializePictureModal() {
        const modal = document.getElementById('pictureModal');
        const closeBtn = modal.querySelector('.close');
        const pictureLabel = document.querySelector('.grid-labels .label:nth-child(9)'); // Picture label
        
        pictureLabel.classList.add('picture-label');
        
        pictureLabel.addEventListener('click', () => {
            this.showPictureHistory();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showPictureHistory() {
        const entriesContainer = document.getElementById('pictureEntries');
        entriesContainer.innerHTML = '';
        
        Object.entries(this.pictureHistory)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .forEach(([date, imageData]) => {
                const entry = document.createElement('div');
                entry.className = 'picture-entry';
                entry.innerHTML = `
                    <div class="date">${new Date(date).toLocaleDateString()}</div>
                    <img src="${imageData}" alt="Daily picture ${new Date(date).toLocaleDateString()}">
                `;
                entriesContainer.appendChild(entry);
            });
    }

    loadBibleHistory() {
        const savedHistory = localStorage.getItem('bibleHistory');
        return savedHistory ? JSON.parse(savedHistory) : {};
    }

    saveBibleHistory() {
        localStorage.setItem('bibleHistory', JSON.stringify(this.bibleHistory));
    }

    initializeBibleModal() {
        const modal = document.getElementById('bibleModal');
        const closeBtn = modal.querySelector('.close');
        const bibleLabel = document.querySelector('.grid-labels .label:nth-child(1)'); // Bible label
        
        bibleLabel.classList.add('clickable');
        
        bibleLabel.addEventListener('click', () => {
            this.showBibleHistory();
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showBibleHistory() {
        const entriesContainer = document.getElementById('bibleEntries');
        entriesContainer.innerHTML = '';
        
        Object.entries(this.bibleHistory)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .forEach(([date, text]) => {
                const entry = document.createElement('div');
                entry.className = 'bible-entry';
                entry.innerHTML = `
                    <div class="date">${new Date(date).toLocaleDateString()}</div>
                    <div class="text">${text}</div>
                `;
                entriesContainer.appendChild(entry);
            });
    }

    showCompletionMessage(message) {
        const modal = document.getElementById('completionModal');
        const messageEl = modal.querySelector('.completion-message');
        const closeBtn = modal.querySelector('.modal-close-btn');
        
        messageEl.textContent = message;
        modal.style.display = 'block';
        
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
}); 