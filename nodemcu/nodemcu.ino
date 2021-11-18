#include <DHT.h>
#include <DHT_U.h>

#include <ESP8266HTTPClient.h>

#include <ESP8266WiFiGratuitous.h>
#include <WiFiServerSecure.h>
#include <WiFiClientSecure.h>
#include <ArduinoWiFiServer.h>
#include <WiFiClientSecureBearSSL.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WiFiUdp.h>
#include <ESP8266WiFiType.h>
#include <CertStoreBearSSL.h>
#include <ESP8266WiFiAP.h>
#include <WiFiClient.h>
#include <BearSSLHelpers.h>
#include <WiFiServer.h>
#include <ESP8266WiFiScan.h>
#include <WiFiServerSecureBearSSL.h>
#include <ESP8266WiFiGeneric.h>
#include <ESP8266WiFiSTA.h>

#define DHTTYPE DHT11
#define dht_dpin 0

DHT dht(dht_dpin, DHTTYPE);

const char *ssid = "network";
const char *password = "IansHotspot29";

const char *serverName = "api.ian.software";

const int httpPort = 443;

const int LED = 14;
const int BUTTON = 16;

const int RED_LED = 12;
const int GREEN_LED = 13;
const int BLUE_LED = 15;

int BUTTON_STATUS = 1;

void setRGBRed() {
    analogWrite(RED_LED, 255);
    analogWrite(GREEN_LED, 0);
    analogWrite(BLUE_LED, 0);
}

void setup(void) {
    Serial.begin(9600);
    dht.begin();

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");

    Serial.println(WiFi.localIP());

    pinMode(LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
    pinMode(GREEN_LED, OUTPUT);
    pinMode(BLUE_LED, OUTPUT);

    pinMode(BUTTON, INPUT);
}

void loop() {

    setRGBRed();
    BUTTON_STATUS = digitalRead(BUTTON);

    if (BUTTON_STATUS == HIGH) {
        Serial.println("APAGADO");
        digitalWrite(LED, LOW);
        setRGBRed();
        return;
    }

    Serial.println("ENCENDIDO");
    digitalWrite(LED, HIGH);

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
        Serial.println("No se puede leer el sensor");
        setRGBRed();
        return;
    } else {
        if (WiFi.status() == WL_CONNECTED) {
            analogWrite(RED_LED, 0);
            analogWrite(GREEN_LED, 255);
            analogWrite(BLUE_LED, 0);
            WiFiClientSecure client;
            client.setInsecure();
            if(!client.connect(serverName, httpPort)){
                Serial.println("Connection failed.");
                return;
            }

            String url = "/payload/upload";
            url += "?temperature=";
            url += t;
            url += "&humidity=";
            url += h;
            Serial.print("Requesting URL: ");
            Serial.println(url);

            client.print(String("GET ") + url + " HTTP/1.1\r\n" +
                         "Host: " + serverName + "\r\n" +
                         "Connection: close\r\n\r\n");
            Serial.println();
            Serial.println("Closing connection");
        } else {
            Serial.println("WiFi Disconnected.");
        }
    }
}
