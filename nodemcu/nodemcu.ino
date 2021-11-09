#include <DHT.h>
#include <DHT_U.h>

const int DHTPin = 0;  //Conectar sensor DHT a pin D3 = GPIO_0
#define DHTTYPE DHT11 //Definimos el tipo de sensor de humedad (DHT11 o DHT22)

DHT dht(DHTPin, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  delay(2000);
}

void loop() {
    
   delay(2000);
 
   
   float h = dht.readHumidity();  //Lectura de Humedad
   float t = dht.readTemperature(); //Lectura de Temperatura
 
   if (isnan(h) || isnan(t)) {
      Serial.println("No se puede leer el sensor");
      return;
   }
 
 
   Serial.print("\n Humedad: ");
   Serial.print(h);
   Serial.print(" %\t");
   Serial.print("\n Temperatura: ");
   Serial.print(t);
   Serial.print(" *C ");
}
