import React, { Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
  useColorScheme,
  Linking,
} from "react-native";

import NfcManager, {
  Ndef,
  NfcAdapter,
  nfcManager,
  NfcTech,
  NfcEvents,
} from "react-native-nfc-manager";
// import NfcManager, {Ndef, NfcTech, ByteParser} from 'react-native-nfc-manager'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      log: "",
      text: "",
      supported: false,
      enabled: false,
    };
  }

  componentDidMount() {
    NfcManager.isSupported(NfcTech.NfcV).then((supported) => {
      this.setState({ supported });
      if (supported) {
        this._startNfc();
      }
    });
  }

  _startNfc = () => {
    NfcManager.start()
      .then(() => NfcManager.isEnabled())
      .then((enabled) => this.setState({ enabled }))
      .catch((err) => {
        console.warn(err);
        this.setState({ enabled: false });
      });
  };

  componentWillUnmount() {
    this._cleanUp();
  }

  _cleanUp = () => {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  onChangeText = (text) => {
    this.setState({
      text,
    });
  };

  sendToMoontech() {
    Linking.openURL("https://moontech-industrial.com/");
  }

  writeData = async () => {
    if (!this.state.text) {
      Alert.alert("Enter some text");
    }

    try {
      if (!this.state.text) {
        Alert.alert("Enter some text");
      }
      let tech = NfcTech.NfcV;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: "Ready for magic",
      });
    } catch (err) {
      this.setState({
        log: err.toString(),
      });
      this.cleanUp();
    }
  };

  createArrayBytes = (Flag) => {
    let arr = [];
    let flag = Flag;
    let inventoryRead = 0xa0;
    let icMfgCode = 0x04;
    let afi = 0x00; // optional
    let maskLength = 0x18; // 24 decimal (3 bytes)
    let maskValue = arrUID.slice(0, 3); //   0C-4A-DC-A9-50-01-04-E0
    let firstBlockNumber = 0x00;
    let numberBlocks = 0x14; //  20 blocks
    let CRC16 = [0x00, 0x00];
    arr.push(
      flag,
      inventoryRead,
      icMfgCode,
      afi,
      maskLength,
      maskValue,
      firstBlockNumber,
      numberBlocks,
      CRC16
    );
    return arr.flat();
  };

  readData = async () => {
    try {
      let tech = NfcTech.NfcV;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: "Ready for magic",
      });

      console.log('first resp', resp);

      let cmd = NfcManager.transceive;

      // rawCommand = [NfcAdapter.FLAG_READER_NFC_V, 0xa0, 0x04, 0x18, 0x0c, 0x4a, 0xdc, 0x00, 0x14, 0x00, 0x00];
      // rawCommand = [NfcAdapter.FLAG_READER_NFC_V, 0xa0, 0x04, 0x18, 0x0c, 0x4a, 0xdc, 0x00, 0x14];
      // rawCommand = [NfcAdapter.FLAG_READER_NFC_V, 0xa0, 0x04, 0x00, 0x18, 0x0c, 0x4a, 0xdc, 0x00, 0x14, 0x00, 0x00];
      // rawCommand = [NfcAdapter.FLAG_READER_NFC_V, 0xa0, 0x04, 0x00, 0x18, 0x0c, 0x4a, 0xdc, 0x00, 0x14];
      // rawCommand = [NfcAdapter.FLAG_READER_NFC_V, 0xb2, 0x04]
      // rawCommand = [0x26, 0xa0, 0x04, 0x18, 0x0c, 0x4a, 0xdc, 0x00, 0x1b]
      rawCommand = [0x26, 0xa1, 0x04, 0x00, 0x03, 0x08];

      console.log('cositas 1');
        resp = cmd(rawCommand)
        .then( response => {
          console.log(response)
        })
        .catch( error => {
          console.log('error cmd', error);
        }

        )
      

      console.log('soy res --> ', resp)
      console.log('cositas 2')
      console.log('he ejecutado --> ', JSON.stringify(rawCommand))


      this._cleanUp();
    } catch (ex) {
      console.log('error 1 catch', ex)
      this.setState({
        log: ex.toString(),
      });
      this._cleanUp();
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.textInput}
          onChangeText={this.onChangeText}
          autoCompleteType="off"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#888888"
          placeholder="Enter text here"
        />
        <Text style={styles.text}>
          {`Is MifareClassic supported ? ${this.state.supported}`}
        </Text>

        <Text style={styles.text}>
          {`Is NFC enabled (Android only)? ${this.state.enabled}`}
        </Text>

        <TouchableOpacity onPress={this.writeData} style={styles.buttonWrite}>
          <Text style={styles.buttonText}>Write</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.readData} style={styles.buttonRead}>
          <Text style={styles.buttonText}>Read</Text>
        </TouchableOpacity>

        <View style={styles.log}>
          <Text> {this.state.log} </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  textInput: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    marginBottom: 10,
    textAlign: "center",
    color: "black",
  },
  text: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    marginBottom: 10,
    textAlign: "center",
    color: "black",
  },
  buttonWrite: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#902235",
  },
  buttonRead: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#006C5B",
  },
  buttonText: {
    color: "white",
  },
  log: {
    marginTop: 30,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
