package tpiv;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;
import javax.json.Json;
import javax.json.JsonObject;

public class PeerThread extends Thread {
    private BufferedReader bufferedReader;

    public PeerThread(Socket socket) throws IOException {
        bufferedReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
    }

    public void run() {
        boolean flag = true;
        while (flag) {
            try {
                JsonObject jsonO = Json.createReader(bufferedReader).readObject();
                if (jsonO.containsKey("username")) {
                    System.out.println("[" + jsonO.getString("username") + "]: " + jsonO.getString("message"));
                }
            } catch (Exception e) {
                flag = false;
                interrupt();
            }

        }
    }
}

