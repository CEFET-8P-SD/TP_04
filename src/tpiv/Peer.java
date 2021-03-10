package tpiv;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.Socket;
import javax.json.Json;

public class Peer {

    public static void main(String[] args) throws Exception {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(System.in));
        System.out.println("Enter username and port for this peer"); // "Informe seu nome de usuario e a porta : "
        String[] setupValues = bufferedReader.readLine().split(" ");
        ServerThread serverThread = new ServerThread(setupValues[1]);
        serverThread.start();
        new Peer().updateListenToPeers(bufferedReader, setupValues[0], serverThread);
    }

    public void updateListenToPeers(BufferedReader bufferedReader, String username, ServerThread serverThread) throws Exception {
        System.out.println("> enter (space separated) hostname:porta");
        System.out.println("peers to receive messages from (s to skip)");// \nInforme o hostname:porta dos seus remetentes( Digite PULAR para ir direto para o chat
        String input = bufferedReader.readLine();
        String[] inputValues = input.split(" ");
        if (!input.equals("s")) {
            for (String inputValue : inputValues) {
                String[] address = inputValue.split(":");
                Socket socket = null;
                try {
                    socket = new Socket(address[0], Integer.parseInt(address[1]));
                    new PeerThread(socket).start();
                } catch (Exception e) {
                    if (socket != null) {
                        socket.close();
                    } else {
                        System.out.println("Invalid input. Skipping to next step.");
                    }
                }
            }
        }
        communicate(bufferedReader, username, serverThread);
    }


    public void communicate(BufferedReader bufferedReader, String username, ServerThread serverThread) {
        try {
            System.out.println("You can now communicate. E to exit, c to change");
            while (true) {
                String message = bufferedReader.readLine();
                if (message.equals("e")) {
                    break;
                } else if (message.equals("c")) {
                    updateListenToPeers(bufferedReader, username, serverThread);
                } else {
                    StringWriter stringW = new StringWriter();
                    Json.createWriter(stringW).writeObject(Json.createObjectBuilder().add("username", username).add("message", message).build());
                    serverThread.sendMessage(stringW.toString());
                }
            }
            System.exit(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
