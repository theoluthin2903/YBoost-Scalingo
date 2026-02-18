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

func parseURLtoDSN(urlStr string) (string, error) {
	u, err := url.Parse(urlStr)
	if err != nil {
		return "", err
	}
	password, _ := u.User.Password()
	host := u.Host
	if !strings.Contains(host, "(") {
		host = "tcp(" + host + ")"
	}
	return fmt.Sprintf("%s:%s@%s%s", u.User.Username(), password, host, u.Path), nil
}

func getMySQLUrl() (string, error) {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl != "" {
		return parseURLtoDSN(dbUrl)
	}
	return "", nil
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

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	tmpl, err := template.ParseFiles("template/index.html")
	if err != nil {
		log.Printf("ERREUR : Impossible de trouver index.html : %v", err)
		http.Error(w, "Erreur interne (Template manquant)", http.StatusInternalServerError)
		return
	}

	err = tmpl.Execute(w, nil)
	if err != nil {
		log.Printf("ERREUR : Echec de l'exécution du template : %v", err)
	}
}

func main() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", homeHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Serveur démarré sur le port %s", port)

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal("ERREUR FATALE (Le serveur n'a pas pu démarrer) : ", err)
	}
}
