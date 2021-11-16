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

import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";
// import NfcManager, {Ndef, NfcTech, ByteParser} from 'react-native-nfc-manager'

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      log: "",
      text: "",
    };
  }

  componentDidMount() {
    NfcManager.start();
  }

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

  readData = async () => {
    try {
      let tech = NfcTech.NfcV;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: "Ready for magic",
      });

      NfcManager.isSupported(tech)
        .then(() => console.log(tech, "is supported"))
        .catch((err) => console.warn(err));

      var seen = [];

      // JSON.stringify(NfcManager, function (key, val) {
      //   if (val != null && typeof val == "object") {
      //     if (seen.indexOf(val) >= 0) {
      //       return;
      //     }
      //     seen.push(val);
      //   }
      //   return val;
      // });

      // console.log('soy seen', seen)
      console.log("soy nfcManager._ndefHandler ", NfcManager._ndefHandler);

      // NfcManager._ndefHandler
      //   .getNdefMessage()
      //   .then( (tagEvent) => console.log('soy tagEvent --> ', tagEvent))
      //   .catch((err) => console.warn(err));

      let cmd = NfcManager.transceive;

      const nfcTag = await NfcManager.getTag();
      console.log("[NFC Read] [INFO] Tag: ", nfcTag);

      const nfcGetLaunchTagEvent = await NfcManager.getLaunchTagEvent();
      console.log("soy nfcGetLaunchTagEvent", JSON.stringify(nfcGetLaunchTagEvent));


      let UID = nfcTag.id;
      console.log("soy UID --> ", UID);

      var arrUID = [];
      for (var i = 0; i < UID.length - 1; i++) {
        arrUID.push(Number('0x' + UID[i] + UID[i + 1]));
        i++;
      }

      console.log("soy UID --> ", arrUID.join(' '));

      // var arrUID = [0x0C,0x4A,0xDC,0xA9, 0x50, 0x01, 0x04, 0xE0];

      { 0x02, 0xB2, 0x04} // High data rate
      { 0x42, 0xB2, 0x04} // High data rate + Option Flag

      const createArrayBytes = (Flag) => {
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
        arr.push(flag, inventoryRead, icMfgCode, afi, maskLength, maskValue, firstBlockNumber, numberBlocks, CRC16);
        return arr.flat();
      };
      

      let rawCommand = new Array(33);
      // rawCommand.fill([
      //   0x04, 0xA0, 0x04, 0x18, 0x0C, 0x4A, 0xDC, 0x00, 0x14, 0x01
      // ])

      rawCommand = [
        createArrayBytes(0x00),
        createArrayBytes(0x02),
        createArrayBytes(0x04),
        createArrayBytes(0x06),
        createArrayBytes(0x20),
        createArrayBytes(0x26),
        createArrayBytes(0x42),
        createArrayBytes(0xB2),
        [0xFF, 0x68, 0x0E, 0x03, 0x10, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0xa0, 0x04, 0x00, 0x00, 0x00, 0x00],
        [0xFF, 0x68, 0x0E, 0x03, 0x0c, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0xa0, 0x04, 0x00, 0x00, 0x00, 0x00]
      ];

      // console.log('SOY array', rawCommand);
      let index = 0;

      for (let i = 0; i < rawCommand.length; i++) {
        // console.log(typeof(rawCommand[i][i]));

        try {
          let res = await cmd(rawCommand[i])
          console.log('soy res --> ', res)
        } catch (err) {
          console.log(err);
        }

        // cmd(rawCommand[i])
        //   .then((resp) => {
        //     console.log("success --> " + resp);
        //   })
        //   .catch((err) => {
        //     console.log("soy error " + i + " " + err);
        //   });
          console.log('he ejecutado --> ', JSON.stringify(rawCommand[i]))
      }

      console.log("soy index ", index);

      // try {
      //   resp = await cmd(rawCommand);
      // } catch (error) {
      //   console.log("soy error ", error);
      // }

      // console.log("soy respuesta ->" + resp);

      this._cleanUp();
    } catch (ex) {
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
