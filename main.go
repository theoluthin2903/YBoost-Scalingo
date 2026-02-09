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
