package main

import (
	"database/sql"
	"html/template"
	"log"
	"net/http"
)

func homeHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	var todos []Todo
	if db != nil {
		rows, err := db.Query("SELECT id, title, done FROM tests ORDER BY id ASC")
		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var t Todo
				rows.Scan(&t.ID, &t.Title, &t.Done)
				todos = append(todos, t)
			}
		}
	}

	tmpl, err := template.ParseFiles("template/index.html")
	if err != nil {
		log.Printf("[ERREUR] Template: %v", err)
		http.Error(w, "Erreur Template", http.StatusInternalServerError)
		return
	}
	log.Printf("[INFO] Page index chargée avec %d tâches", len(todos))
	tmpl.Execute(w, todos)
}

func addTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	title := r.FormValue("title")
	log.Printf("[DEBUG] Tentative d'ajout de la tâche %s", title)

	if title == "" {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	if db != nil {
		_, err := db.Exec("INSERT INTO tests (title, done) VALUES (?, ?)", title, false)
		if err != nil {
			log.Printf("[ERREUR CRITIQUE SQL] : %v", err)
			http.Error(w, "Erreur SQL : "+err.Error(), http.StatusInternalServerError)
			return
		}
		log.Printf("[SUCCESS] Tâche %s ajoutée", title)
	} else {
		log.Println("[ERREUR] DB est nil !")
		http.Error(w, "Connexion DB perdue", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func deleteTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	log.Printf("[DEBUG] Tentative de suppression de la tâche %s", id)

	if id == "" {
		log.Println("[ERREUR] ID manquant dans l'URL")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	_, err := db.Exec("DELETE FROM tests WHERE id = ?", id)

	if err != nil {
		log.Printf("[ERREUR SQL] Échec de la suppression pour la tâche %s : %v", id, err)
		http.Error(w, "Erreur suppression : "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[SUCCESS] Tâche %s supprimée", id)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func updateTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	_, err := db.Exec("UPDATE tests SET done = NOT done WHERE id = ?", id)
	if err == nil {
		log.Printf("[SUCCESS] état tâche à l'ID %s modifié !", id)
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
