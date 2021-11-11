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

const char* ssid = "network";
const char* password = "IansHotspot29";

const char* serverName = "api.ian.software";

unsigned long lastTime = 0;
unsigned long timerDelay = 2000;

void setup(void)
{ 
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
}
void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature(); 

  if (isnan(h) || isnan(t)) {
    Serial.println("No se puede leer el sensor");
    return;
  } else {
    if((millis() - lastTime) > timerDelay){
      if(WiFi.status() == WL_CONNECTED){
  
        
       WiFiClientSecure client;
       const int httpPort = 443;
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
      lastTime = millis();
    }
  }
}
