package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

var embeddedFiles embed.FS

func main() {
	staticWin, _ := fs.Sub(embeddedFiles, "static")
	staticHandler := http.StripPrefix("/static/", http.FileServer(http.FS(staticWin)))
	http.Handle("/static/", staticHandler)

	templateWin, _ := fs.Sub(embeddedFiles, "template")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			data, _ := fs.ReadFile(templateWin, "index.html")
			w.Write(data)
			return
		}

		data, err := fs.ReadFile(templateWin, r.URL.Path[1:])
		if err != nil {
			errorData, _ := fs.ReadFile(templateWin, "error.html")
			w.WriteHeader(http.StatusNotFound)
			w.Write(errorData)
			return
		}
		w.Write(data)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "1234"
	}

	log.Printf("Serveur Bingo lancé sur le port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
