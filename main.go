package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		errorHandler(w, r, http.StatusNotFound)
		return
	}

	tmpl, err := template.ParseFiles("template/index.html")
	if err != nil {
		log.Println(err)
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}

	tmpl.Execute(w, nil)
}

func errorHandler(w http.ResponseWriter, r *http.Request, status int) {
	w.WriteHeader(status)
	tmpl, err := template.ParseFiles("template/error.html")
	if err != nil {
		http.Error(w, http.StatusText(status), status)
		return
	}

	data := struct {
		Status  int
		Message string
	}{
		Status:  status,
		Message: http.StatusText(status),
	}

	tmpl.Execute(w, data)
}

func main() {
	http.HandleFunc("/", homeHandler)

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Serveur lancé sur le port " + port)
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
