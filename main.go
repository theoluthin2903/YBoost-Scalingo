package main

import (
	"fmt"
	"net/http"
)

func pageAccueil(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		http.ServeFile(w, r, "index.html")
	} else {
		http.ServeFile(w, r, r.URL.Path[1:])
	}
}

func main() {
	http.HandleFunc("/", pageAccueil)

	fmt.Println("Le serveur est démarré sur le lien suivant : http://localhost:2918")
	http.ListenAndServe(":2918", nil)
}
