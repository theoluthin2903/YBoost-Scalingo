package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
)

func homeHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	var todos []Todo
	if db != nil {
		rows, err := db.Query("SELECT id, title, done FROM tests ORDER BY created_at DESC")
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
	title := r.FormValue("title")
	if title != "" {
		_, err := db.Exec("INSERT INTO tests (title) VALUES (?)", title)
		if err == nil {
			log.Printf("[SUCCESS] Ajout de: %s", title)
		}
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func deleteTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	_, err := db.Exec("DELETE FROM tests WHERE id = ?", id)
	if err != nil {
		log.Printf("[ERREUR] Échec de la suppression: %v", err)
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	var maxID int
	err = db.QueryRow("SELECT COALESCE(MAX(id), 0) FROM tests").Scan(&maxID)
	if err == nil {
		query := fmt.Sprintf("ALTER TABLE tests AUTO_INCREMENT = %d", maxID+1)
		db.Exec(query)
	}

	log.Printf("[SUCCESS] Tâche %s supprimée et compteur réinitialisé à %d", id, maxID+1)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func updateTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	_, err := db.Exec("UPDATE tests SET done = NOT done WHERE id = ?", id)
	if err == nil {
		log.Printf("[SUCCESS] Toggle état ID: %s", id)
	}
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func parseURLtoDSN(urlStr string) (string, error) {
	u, err := url.Parse(urlStr)
	if err != nil {
		return "", err
	}
	pass, _ := u.User.Password()
	host := u.Host
	if !strings.Contains(host, "(") {
		host = "tcp(" + host + ")"
	}
	return fmt.Sprintf("%s:%s@%s%s", u.User.Username(), pass, host, u.Path), nil
}

func openDB() (*sql.DB, error) {
	dbUrl := os.Getenv("SCALINGO_MYSQL_URL")
	if dbUrl == "" {
		return nil, fmt.Errorf("DB SCALINGO_MYSQL_URL vide")
	}
	dsn, _ := parseURLtoDSN(dbUrl)
	db, _ := sql.Open("mysql", dsn)
	return db, db.Ping()
}

func main() {
	db, err := openDB()
	if err != nil {
		log.Printf("[CRITIQUE] DB non connectée: %v", err)
	} else {
		log.Println("[INFO] DB connectée")
		db.Exec(`CREATE TABLE IF NOT EXISTS tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255),
            done BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) { homeHandler(w, r, db) })
	http.HandleFunc("/add", func(w http.ResponseWriter, r *http.Request) { addTodoHandler(w, r, db) })
	http.HandleFunc("/delete", func(w http.ResponseWriter, r *http.Request) { deleteTodoHandler(w, r, db) })
	http.HandleFunc("/update", func(w http.ResponseWriter, r *http.Request) { updateTodoHandler(w, r, db) })

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("[INFO] Serveur sur http://localhost:%s", port)
	http.ListenAndServe(":"+port, nil)
}
