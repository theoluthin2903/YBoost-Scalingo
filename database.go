package main

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

func openDB() (*sql.DB, error) {
	dbUrl := os.Getenv("SCALINGO_MYSQL_URL")
	if dbUrl == "" {
		return nil, fmt.Errorf("SCALINGO_MYSQL_URL environment variable not set")
	}

	dsn, err := parseURLtoDSN(dbUrl)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}
	return db, nil
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

func getMySQLUrl() (string, error) {
	dbUrl := os.Getenv("SCALINGO_MYSQL_URL")
	if dbUrl != "" {
		return parseURLtoDSN(dbUrl)
	}
	return "", nil
}