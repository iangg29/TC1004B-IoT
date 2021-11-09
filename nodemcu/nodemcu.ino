#include <DHT.h>
#include <DHT_U.h>

#define DHTTYPE DHT11
#define dht_dpin 0
DHT dht(dht_dpin, DHTTYPE); 

void setup(void)
{ 
  Serial.begin(9600);  
  dht.begin();
  Serial.println("Humedad y Temperatura\n\n");
  delay(2000);

}
void loop() {
    delay(2000);
    
    float h = dht.readHumidity();
    float t = dht.readTemperature(); 

    if (isnan(h) || isnan(t)) {
      Serial.println("No se puede leer el sensor");
      return;
    }
            
    Serial.print("\n Humedad: ");
     Serial.print(h);
     Serial.print(" %\t");
     Serial.print("\n Temperatura: ");
     Serial.print(t);
     Serial.print(" ºC ");
    delay(800);
}
