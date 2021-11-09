package main

import (
	"crypto/tls"
	"crypto/x509"
	"database/sql"
	"encoding/json"
	"github.com/go-sql-driver/mysql"
	"io/ioutil"
	"log"
	"net/http"
	"os"

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

type IncomingRequest struct {
	Temperature float32 `json:"temperature"`
	Humidity    float32 `json:"humidity"`
}

func getTemperatures(w http.ResponseWriter, r *http.Request) {
	// fmt.Println("Endpoint Hit: get temperatures")
	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(http.StatusOK)
	// json.NewEncoder(w).Encode(temps)
	return
}

func createTemperature(w http.ResponseWriter, r *http.Request) {
	// var newTemperature Temperature
	// fmt.Println("Endpoint Hit: createTemperature")
	// reqBody, err := ioutil.ReadAll(r.Body)
	// if err != nil {
	// 	fmt.Fprintf(w, "Please insert a valid temperature.")
	// 	w.WriteHeader(http.StatusBadRequest)
	// 	return
	// }
	// json.Unmarshal(reqBody, &newTemperature)
	// newTemperature.Id = len(temps) + 1
	// temps = append(temps, newTemperature)
	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(newTemperature)
	return
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

func main() {
	log.Println("Loading TC1004B API version", Version)
	db := setupDB()
	defer db.Close()
	router := mux.NewRouter()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		WriteAPIResponse(w, APIResponse{http.StatusBadRequest, "bad request"})
	})
	router.HandleFunc("/data", func(rw http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT * FROM data")
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
	router.HandleFunc("/data", func(rw http.ResponseWriter, r *http.Request) {
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
		rw.WriteHeader(http.StatusOK)
	}).Methods("POST")
	log.Fatal(http.ListenAndServe(":8080", router))
	log.Println("Listening on :8080")
}

func WriteAPIResponse(w http.ResponseWriter, response APIResponse) {
	formattedResponse, _ := json.Marshal(&response)
	w.WriteHeader(response.Code)
	w.Write(formattedResponse)
}
