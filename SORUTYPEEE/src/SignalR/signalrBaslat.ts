import * as signalR from "@microsoft/signalr"
import connection from "./signalr"

let baslatmaPromise: Promise<void> | null = null

export async function signalRBaslat() {
  if (
    connection.state ===
    signalR.HubConnectionState.Connected
  ) {
    return
  }

  if (
    connection.state ===
    signalR.HubConnectionState.Connecting
  ) {
    if (baslatmaPromise) {
      await baslatmaPromise
    }

    return
  }

  baslatmaPromise = connection.start()

  try {
    await baslatmaPromise
    console.log(
      "SignalR bağlantısı başarılı"
    )
  } finally {
    baslatmaPromise = null
  }
}
