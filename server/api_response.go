package main

import "net/http"

var ResponseOK = APIResponse{http.StatusOK, ""}
var ResponseBadAPIRequest = APIResponse{http.StatusBadRequest, "bad request"}
var ResponseInvalidSession = APIResponse{http.StatusForbidden, "invalid session"}
var ResponseInvalidEndpoint = APIResponse{http.StatusBadRequest, "no such endpoint"}
var ResponseInvalidMethod = APIResponse{http.StatusBadRequest, "invalid request method"}
var ResponseRequiresAuth = APIResponse{http.StatusBadRequest, "this method requires authentication"}

var ResponseOopsie = APIResponse{http.StatusInternalServerError, "internal error"}
var ResponseUnknownResource = APIResponse{http.StatusNotFound, "unknown resource"}
