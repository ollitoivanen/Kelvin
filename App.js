import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Button,
  Dimensions,
  SafeAreaView
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
      rooms: data.locations.rooms,
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

    this.socket.on("site", ({ data }) => {
      this.dataToState(data);
    });
  }

  toggleLight = (id, state, lamp) => {
    let devices = this.state.devices;
    let lampState = devices.find(o => o.id === lamp).state.on;
    console.warn(lampState);
    let data = {
      id,
      state: { on: !lampState, bri: lampState ? 0 : 255 }
    };

    this.socket.emit("apply/room", {
      siteKey: config.siteKey,
      data
    });
  };

  render() {
    if (this.state.loading) return null;

    let rooms = this.state.rooms;
    let devices = this.state.devices;
    //Filters all devices which have x,y position given
    let items = rooms.filter(room => id[room.id]);
    //console.warn(id["da529fe6-be8f-4680-8759-ef29cba09646"].lamp)

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ aspectRatio: 2.12, width: "100%" }}>
          <Image
            style={{ width: "100%", height: "100%" }}
            source={require("./src/img/blueprint.png")}
          />
          <React.Fragment>
            {items.map(item => (
              <TouchableOpacity
                style={{
                  position: "absolute",
                  left: id[item.id].x,

                  bottom: id[item.id].y,
                  marginLeft: -15,
                  marginBottom: -15,
                  height: 30,
                  width: 30,
                  borderRadius: 30,
                  backgroundColor: "yellow"
                }}
                title={item.name}
                key={item.id}
                onPress={() => {
                  this.toggleLight(item.id, item.state, id[item.id].lamp);
                }}
              />
            ))}
          </React.Fragment>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
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
