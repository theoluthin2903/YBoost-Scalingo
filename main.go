package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	tmpl, err := template.ParseFiles("index.html")
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, nil)
}

func main() {
	http.HandleFunc("/", homeHandler)
	fs := http.FileServer(http.Dir("."))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Println("Serveur sur port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}