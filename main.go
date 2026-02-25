package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
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
	log.Printf("[INFO] Serveur démarré sur http://localhost:%s", port)
	http.ListenAndServe(":"+port, nil)
}
