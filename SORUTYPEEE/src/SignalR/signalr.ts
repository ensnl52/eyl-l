import * as signalR from "@microsoft/signalr"

const connection =
  new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7295/oyunHub", {
      accessTokenFactory: () => {
        const token = localStorage.getItem("token")

        console.log(
          "SignalR token var mı:",
          !!token
        )

        return token || ""
      }
    })
    .build()

export default connection