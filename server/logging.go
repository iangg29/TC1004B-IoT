package main

import "log"

func LogInfo(info string) {
	log.Println("[INFO]", info)
}

func LogWarn(warning interface{}) {
	log.Println("[WARN]", warning)
}

func LogErr(error interface{}) {
	log.Println("[ERR]", error)
}
