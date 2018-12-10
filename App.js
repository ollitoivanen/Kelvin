import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button
} from "react-native";
import io from "socket.io-client";
import config from "./src/config.json";
import id from "./src/id.json";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lightOn: false,
      loading: true,
      data: []
    };

    this.socket = null;
  }

  dataToState = data => {
    this.setState({
      loading: false,
      devices: data.devices
    });
  };

  componentDidMount() {
    this.socket = io.connect(
      "https://houmkolmonen.herokuapp.com",
      {
        reconnectionDelay: 1000,
        reconnectionDelayMax: 3000
        //transports: ["websocket"]
      }
    );

    fetch(`https://houmkolmonen.herokuapp.com/api/site/${config.siteKey}`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        this.dataToState(data);
      })
      .catch(e => {
        console.log(e);
      });

    this.socket.emit("subscribe", { siteKey: config.siteKey });

    this.socket.on("siteKeyFound", ({ siteKey, data }) => {});

    this.socket.on("site", ({ data }) => {
      this.dataToState(data);
    });

    /*this.socket.on("site", ({ data }) => {
      this.dataToState(data);
    });*/
  }

  toggleLight = (id, state) => {
    let onOff = state.on;
    let data = {
      id,
      state: { on: !onOff, bri: onOff ? 0 : 255 }
    };

    console.warn(data);

    this.socket.emit("apply/device", {
      siteKey: config.siteKey,
      data
    });
  };

  render() {
    if (this.state.loading) return null;

    let devices = this.state.devices;
    //Filters all devices which have x,y position given
    let items = devices.filter(device => id[device.id]);

    return (
      <View style={styles.container}>
        <React.Fragment>
          {items.map(item => (
            <TouchableOpacity
              style={{
                position: "absolute",
                left: id[item.id].x,
                backgroundColor: this.state.on ? "yellow" : "#3facff",
                padding: 20
              }}
              title={item.name}
              key={item.id}
              onPress={() => {
                this.toggleLight(item.id, item.state);
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </React.Fragment>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },

  onButton: {
    backgroundColor: "#3facff",
    padding: 10,
    borderRadius: 10
  },

  onText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  }
});
