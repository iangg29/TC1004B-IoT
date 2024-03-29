package main

import (
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"encoding/json"
	"github.com/go-sql-driver/mysql"
	"github.com/pusher/pusher-http-go"
	"github.com/rs/cors"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

const (
	Version       = "v0.1-DEV"
	APIVersion    = "v1"
	LocalBasePath = "/" + APIVersion
)

type APIResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type DBResult struct {
	Id          int     `json:"id"`
	Temperature float32 `json:"temperature"`
	Humidity    float32 `json:"humidity"`
	CreatedAt   string  `json:"created_at"`
}

type EventRecord struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	CreatedAt   string  `json:"created_at"`
}

type IncomingRequest struct {
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
}

func setupDB() *sql.DB {
	rootCertPool := x509.NewCertPool()
	pem, err := ioutil.ReadFile("./tc1004bdbcert.cer")
	if err != nil {
		log.Fatal(err)
	}
	if ok := rootCertPool.AppendCertsFromPEM(pem); !ok {
		log.Fatal("Failed to append PEM.")
	}
	mysql.RegisterTLSConfig("custom", &tls.Config{
		RootCAs: rootCertPool,
	})
	db, err := sql.Open("mysql", os.Getenv("DB_USERNAME")+":"+os.Getenv("DB_PASSWORD")+"@tcp("+os.Getenv("DB_HOST")+":"+os.Getenv("DB_PORT")+")/"+os.Getenv("DB_DATABASE")+"?tls=custom")
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func setUpPusher() *pusher.Client {
	pusherClient := pusher.Client{
		AppID:   os.Getenv("PUSHER_APP_ID"),
		Key:     os.Getenv("PUSHER_KEY"),
		Secret:  os.Getenv("PUSHER_SECRET"),
		Cluster: os.Getenv("PUSHER_CLUSTER"),
		Secure:  true,
	}
	return &pusherClient
}

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	io.WriteString(w, `{"alive": true}`)
}

func main() {
	log.Println("Loading TC1004B API version", Version)

	db := setupDB()
	pusherClient := setUpPusher()

	defer db.Close()

	router := mux.NewRouter()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		WriteAPIResponse(w, APIResponse{http.StatusBadRequest, "bad request"})
	})
	router.HandleFunc("/data", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("[ENDPOINT] Hit GET (/data).")
		rows, err := db.Query("SELECT * FROM data ORDER BY created_at DESC")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		var result []DBResult
		for rows.Next() {
			var temp DBResult
			err := rows.Scan(&temp.Id, &temp.Temperature, &temp.Humidity, &temp.CreatedAt)
			if err != nil {
				log.Fatal(err)
			}
			result = append(result, temp)
		}
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		json.NewEncoder(rw).Encode(result)
	}).Methods("GET")
	router.HandleFunc("/data/delete/all", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("[ENDPOINT] Hit GET (/data/delete/all).")
		_, err := db.Exec("DELETE FROM data")
		if err != nil {
			log.Fatal(err)
		}
		var response = APIResponse{Code: 200, Message: "All records have been deleted successfully!"}
		rw.Header().Set("Content-Type", "application/json")
		rw.WriteHeader(http.StatusOK)
		json.NewEncoder(rw).Encode(response)
	}).Methods("DELETE")
	router.HandleFunc("/payload/upload", func(rw http.ResponseWriter, r *http.Request) {
		rw.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == http.MethodOptions {
			return
		}
		log.Println("[ENDPOINT] Hit POST (/payload/upload).")
		if r.Header.Get("Content-Type") != "" {
			value := r.Header.Get("Content-Type")
			if value != "application/json" {
				msg := "Content-Type header is not application/json"
				log.Println("Content-Type header is not application/json")
				http.Error(rw, msg, http.StatusUnsupportedMediaType)
				return
			}
		}
		r.Body = http.MaxBytesReader(rw, r.Body, 1048576)
		dec := json.NewDecoder(r.Body)
		dec.DisallowUnknownFields()
		var newRecord IncomingRequest
		err := dec.Decode(&newRecord)
		if err != nil {
			log.Println("DECODING ERROR!!!")
			http.Error(rw, err.Error(), http.StatusBadRequest)
			return
		}
		stmt, err := db.Prepare("INSERT INTO data (temperature, humidity) VALUES (?, ?)")
		if err != nil {
			log.Println("QUERY PREPARATION ERROR!!!!!")
			log.Fatal(err.Error())
		}
		_, er := stmt.Exec(newRecord.Temperature, newRecord.Humidity)
		if er != nil {
			log.Println("QUERY EXECUTION ERROR!!!!!")
			panic(er.Error())
		}
		var eventRecord EventRecord
		eventRecord.Temperature = newRecord.Temperature
		eventRecord.Humidity = newRecord.Humidity
		eventRecord.CreatedAt = time.Now().Format("15:04:05 2006-01-02")
		data := map[string]EventRecord{"record": eventRecord}
		pusherClient.Trigger("data-fetch", "new-record", data)
		rw.WriteHeader(http.StatusOK)
	}).Methods("POST")
	router.HandleFunc("/payload/upload", func(rw http.ResponseWriter, r *http.Request) {
		log.Println("[ENDPOINT] Hit GET (/payload/upload).")
		temperature, ok := r.URL.Query()["temperature"]
		if !ok || len(temperature[0]) < 1 {
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
		humidity, ok := r.URL.Query()["humidity"]
		if !ok || len(humidity[0]) < 1 {
			rw.WriteHeader(http.StatusBadRequest)
			return
		}
		temperatureVar := temperature[0]
		humidityVar := humidity[0]
		var newRecord EventRecord
		newRecord.Temperature, _ = strconv.ParseFloat(string(temperatureVar), 64)
		newRecord.Humidity, _ = strconv.ParseFloat(string(humidityVar), 64)
		location, err := time.LoadLocation("America/Mexico_City")
		if err != nil {
			log.Fatal(err)
		}
		newRecord.CreatedAt = time.Now().In(location).Format("2006-01-02 15:04:05")

		stmt, err := db.Prepare("INSERT INTO data (temperature, humidity) VALUES (?, ?)")
		if err != nil {
			log.Println("QUERY PREPARATION ERROR!!!!!")
			log.Fatal(err.Error())
		}
		_, er := stmt.Exec(newRecord.Temperature, newRecord.Humidity)
		if er != nil {
			log.Println("QUERY EXECUTION ERROR!!!!!")
			panic(er.Error())
		}
		data := map[string]EventRecord{"record": newRecord}
		pusherClient.Trigger("data-fetch", "new-record", data)
		rw.WriteHeader(http.StatusOK)

	}).Methods("GET")
	router.HandleFunc("/health", HealthCheckHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST"},
	})

	handler := c.Handler(router)

	log.Fatal(http.ListenAndServe(":8080", handler))
}

func WriteAPIResponse(w http.ResponseWriter, response APIResponse) {
	formattedResponse, _ := json.Marshal(&response)
	w.WriteHeader(response.Code)
	w.Write(formattedResponse)
}
