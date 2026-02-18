const deleteButtons = document.querySelectorAll('.btn-delete');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const response = confirm("Voulez-vous vraiment supprimer cette tâche ?");
            if (!response) {
                e.preventDefault();
            }
        });
    });

    console.log("[INFO] Scripts de gestion des tâches chargés.");

    const todoTexts = document.querySelectorAll('.todo-item span');
    todoTexts.forEach(text => {
        text.style.cursor = "pointer";
        text.addEventListener('click', (e) => {
            const updateLink = e.target.parentElement.querySelector('.btn-check').href;
            window.location.href = updateLink;
        });
    });