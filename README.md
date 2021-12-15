# reader-nfc-rn


read and high speed flags (32, 32), 
tag id
last byte is the byte address you want to read

[32, 32, ...idBytes, 0]

con React Native solo se puede hacer la lectura 'single block' (bloque a bloque)
https://stackoverflow.com/questions/40798116/write-multiple-blocks-command-failed-over-nfcv

el mismo rawCommand ( [32, 32, ...idBytes, 0] ) funciona con Ionic.
misma logica
