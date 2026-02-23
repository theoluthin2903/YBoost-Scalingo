package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

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
	log.Printf("[DEBUG] Tentative d'ajout du titre %s", title)

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
		log.Printf("[SUCCESS] Tâche ajoutée : %s", title)
	} else {
		log.Println("[ERREUR] DB est nil !")
		http.Error(w, "Connexion DB perdue", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/", http.StatusSeeOther)
}

func deleteTodoHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	log.Printf("[DEBUG] Tentative de suppression de l'ID %s", id)

	if id == "" {
		log.Println("[ERREUR] ID manquant dans l'URL")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	_, err := db.Exec("DELETE FROM tests WHERE id = ?", id)

	if err != nil {
		log.Printf("[ERREUR SQL] Échec de la suppression pour l'ID %s : %v", id, err)
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

func getMySQLUrl() (string, error) {
	dbUrl := os.Getenv("SCALINGO_MYSQL_URL")
	if dbUrl != "" {
		return parseURLtoDSN(dbUrl)
	}
	return "", nil
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
	dbUrl, err := getMySQLUrl()
	if dbUrl == "" {
		return nil, fmt.Errorf("SCALINGO_MYSQL_URL environment variable not set")
	}
	db, err := sql.Open("mysql", dbUrl)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %v", err)
	}
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	return db, nil
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
