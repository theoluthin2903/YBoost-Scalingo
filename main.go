package main

import (
  "net/http"
  "os"
  "html/template"
  "log"
)

func homeHandler(w http.ResponseWriter, r *http.Request) {
 if r.URL.Path != "/" {
  errorHandler(w, r, http.StatusNotFound)
  return
 }

 tmpl, err := template.ParseFiles("template/index.html")
 if err != nil {
  log.Println("Erreur template index.html:", err)
  http.Error(w, "Erreur serveur", http.StatusInternalServerError)
  return
 }

 err = tmpl.Execute(w, nil)
 if err != nil {
  log.Println("Erreur exécution template index.html:", err)
 }
}


func errorHandler(w http.ResponseWriter, r *http.Request, status int) {
 w.WriteHeader(status)
 tmpl, err := template.ParseFiles("template/error.html")
 if err != nil {
  log.Println("Erreur template error.html:", err)
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

 err = tmpl.Execute(w, data)
 if err != nil {
  log.Println("Erreur exécution template error.html:", err)
 }
}


func main() {
http.HandleFunc("/", homeHandler)

fs := http.FileServer(http.Dir("static"))
http.Handle("/static/", http.StripPrefix("/static/", fs))

port := "3000"
if os.Getenv("PORT") != "" {
   port = os.Getenv("PORT")
}

log.Println("Serveur démarré sur http://localhost:" + port)
log.Fatal(http.ListenAndServe(":"+port, nil))

}