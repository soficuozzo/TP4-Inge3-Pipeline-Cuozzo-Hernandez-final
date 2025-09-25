package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
)

type Message struct {
	ID      int    `json:"id"`
	Content string `json:"message"`
}

var db *sql.DB

func main() {
	dbUser := os.Getenv("DB_USERNAME")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_DATABASE")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPass, dbHost, dbPort, dbName)

	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error al conectar a la base de datos: %v", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatalf("Error al hacer ping a la base de datos: %v", err)
	}
	fmt.Println("Conectado exitosamente a la base de datos MySQL!")

	http.HandleFunc("/api/messages", messagesHandler)
	http.HandleFunc("/api/messages/", messageByIDHandler)

	fmt.Println("Servidor iniciado en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func messagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	switch r.Method {
	case "GET":
		readAllMessages(w, r)
	case "POST":
		createMessage(w, r)
	default:
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
	}
}

func messageByIDHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		return
	}

	idStr := r.URL.Path[len("/api/messages/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID de mensaje inválido", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		readMessageByID(w, r, id)
	case "PUT":
		updateMessage(w, r, id)
	case "DELETE":
		deleteMessage(w, r, id)
	default:
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
	}
}

// readAllMessages maneja la lectura de todos los mensajes
func readAllMessages(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, message FROM test")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al leer los mensajes: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.Content); err != nil {
			http.Error(w, fmt.Sprintf("Error al escanear fila: %v", err), http.StatusInternalServerError)
			return
		}
		messages = append(messages, msg)
	}

	if len(messages) == 0 {
		json.NewEncoder(w).Encode([]Message{})
		return
	}

	json.NewEncoder(w).Encode(messages)
}

// readMessageByID maneja la lectura de un mensaje por ID
func readMessageByID(w http.ResponseWriter, r *http.Request, id int) {
	row := db.QueryRow("SELECT id, message FROM test WHERE id = ?", id)
	var msg Message
	err := row.Scan(&msg.ID, &msg.Content)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al leer el mensaje: %v", err), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(msg)
}

// createMessage maneja la creación de un nuevo mensaje
func createMessage(w http.ResponseWriter, r *http.Request) {
	var msg Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	res, err := db.Exec("INSERT INTO test (message) VALUES (?)", msg.Content)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al crear el mensaje: %v", err), http.StatusInternalServerError)
		return
	}
	lastInsertID, _ := res.LastInsertId()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "Mensaje creado",
		"id":     lastInsertID,
	})
}

// updateMessage maneja la actualización del mensaje
func updateMessage(w http.ResponseWriter, r *http.Request, id int) {
	var msg Message
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	_, err := db.Exec("UPDATE test SET message = ? WHERE id = ?", msg.Content, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al actualizar el mensaje: %v", err), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "Mensaje actualizado"})
}

// deleteMessage maneja la eliminación del mensaje
func deleteMessage(w http.ResponseWriter, r *http.Request, id int) {
	_, err := db.Exec("DELETE FROM test WHERE id = ?", id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error al eliminar el mensaje: %v", err), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"status": "Mensaje eliminado"})
}
