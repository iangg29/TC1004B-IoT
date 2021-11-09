package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

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

type Temperature struct {
	Id   int     `json:"id"`
	Data float32 `json:"data"`
}

type allTemperatures []Temperature

var temps = allTemperatures{
	{
		Id:   1,
		Data: 20.1,
	},
	{
		Id:   2,
		Data: 21.2,
	},
	{
		Id:   3,
		Data: 19.3,
	},
	{
		Id:   4,
		Data: 25.4,
	},
}

func getTemperatures(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: get temperatures")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(temps)
}

func createTemperature(w http.ResponseWriter, r *http.Request) {
	var newTemperature Temperature
	fmt.Println("Endpoint Hit: createTemperature")
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(w, "Please insert a valid temperature.")
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	json.Unmarshal(reqBody, &newTemperature)
	newTemperature.Id = len(temps) + 1
	temps = append(temps, newTemperature)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newTemperature)
}

func index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello World!")
}

func main() {
	log.Println("Loading TC1004B API version", Version)

	router := mux.NewRouter()

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		WriteAPIResponse(w, APIResponse{http.StatusBadRequest, "bad request"})
	})

	router.HandleFunc("/", index)
	router.HandleFunc("/temperatures", getTemperatures).Methods("GET")
	router.HandleFunc("/temperatures", createTemperature).Methods("POST")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func WriteAPIResponse(w http.ResponseWriter, response APIResponse) {
	formattedResponse, _ := json.Marshal(&response)
	w.WriteHeader(response.Code)
	w.Write(formattedResponse)
}
