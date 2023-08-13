"use client";
import {useEffect, useRef, useState} from "react";
import {Duck, DuckProps} from "@/app/components/Duck";
import 'flowbite';
import {ServerClientSelection} from "@/app/components/ServerClientSelection";
import {MyDataConnection, MyPeer} from "@/app/types/Peer";
import {Button, Card, Label, TextInput} from "flowbite-react";

type connection = {
    [key: string]: {
        conn: MyDataConnection
        name: string
        peerId: string
    }
}

type connectionMessage = {
    type: "connect",
    data: {
        peerId: string
        name: string
        imageUrl: string
    }
}

type updateDucksMessage = {
    type: "updateDucks",
    data: DuckProps[]
}

type sendChatMessage = {
    type: "chatMessage",
    data: chatMessage
}

type chatMessage = {
    senderId: string,
    senderName: string,
    message: string
}

export default function Home() {
    const [connectionType, setConnectionType] = useState<"server" | "client" | null>(null);
    const [connections, setConnections] = useState<connection>({});
    useEffect(() => {
        import("peerjs").then(({default: Peer}) => {
            const peer = new Peer();
            peer.on('open', function (id: string) {
                console.log('My peer ID is: ' + id);
            });
            setPeer(peer);
        });
    }, []);
    const [peer, setPeer] = useState<MyPeer>();
    const [chatMessages, setChatMessages] = useState<chatMessage[]>([]);

    const [chatMessage, setChatMessage] = useState<string>("");

    const [duckName, setDuckName] = useState<string>("");

    const [serverPeerId, setServerPeerId] = useState<string>("");
    const [ducks, setDucks] = useState<DuckProps[]>([]);
    const [tickRate, setTickRate] = useState(100);
    const [distanceRequired, setDistanceRequired] = useState(1000);
    const [winner, setWinner] = useState<DuckProps | null>(null);

    const timer = useRef<NodeJS.Timeout | null>(null);

    const addDuck = (duckName: string, imageUrl?: string) => {
        setDucks((ducks) => {
            const newDucks = [...ducks, {x: 0, name: duckName, imageUrl: imageUrl}];
            updateClientsDucks(newDucks)
            return newDucks
        });
    }


    const checkForWinner = (ducks: DuckProps[]) => {
        const maxDuck = ducks.reduce((max, duck) => {
            return Math.max(max.x, duck.x) ? max : duck;
        });

        return maxDuck.x >= distanceRequired ? maxDuck : null;
    }

    const startRace = () => {
        if (timer.current) {
            return false;
        }
        timer.current = setInterval(() => {
            setDucks((ducks) => {
                const winner = checkForWinner(ducks);
                if (winner) {
                    clearTimeout(timer.current as NodeJS.Timeout);
                    timer.current = null;
                    setWinner(winner);
                    return ducks;
                }

                const newDucks = ducks.map((duck) => {
                    const variance = Math.random() * 10;
                    return {...duck, x: duck.x + 10 + variance}
                })

                updateClientsDucks(newDucks);

                return newDucks
            });
        }, tickRate);
    }

    const resetRace = () => {
        setWinner(null);
        clearTimeout(timer.current as NodeJS.Timeout);
        timer.current = null;
        setDucks((ducks) => {
            const newDucks = ducks.map((duck) => {
                return {...duck, x: 0}
            })
            updateClientsDucks(newDucks);

            return newDucks
        });
    }

    const sendChatMessage = () => {
        if (!peer || chatMessage == "") {
            return;
        }
        setChatMessages((chatMessages) => {
           return [...chatMessages, {senderId: peer.id, senderName: duckName, message: chatMessage}]
        });

        updateConnectionsChatMessages(peer.id, duckName, chatMessage)

        setChatMessage("");
    }

    const updateConnectionsChatMessages = (senderId: string, senderName: string, message: string) => {
        Object.keys(connections).forEach((connId) => {
            if(connections[connId].peerId === senderId) {
                return;
            }
            const conn = connections[connId].conn;
            const chatMessage = {
                type: "chatMessage",
                data: {
                    senderId: senderId,
                    senderName: senderName,
                    message: message
                }
            };

            console.log("sending message", chatMessage, connections[connId].peerId)
            conn.send(chatMessage);
        });
    }

    const updateClientsDucks = (ducks: DuckProps[]) => {
        const message: updateDucksMessage = {
            type: "updateDucks",
            data: ducks
        }

        Object.keys(connections).forEach((connId) => {
            console.log("sending ducks to client", connId)
            const conn = connections[connId].conn;
            conn.send(message);
        });
    }

    const connectToServer = (duckName: string, serverId: string, imageUrl?: string) => {
        if (!peer || duckName == "" || serverId == "") {
            return;
        }
        setConnectionType("client");
        setDuckName(duckName);

        const conn = peer.connect(serverId);

        console.log("connecting to server", serverId)

        conn.on('open', function () {
            console.log("sending message")
            conn.send({
                type: "connect",
                data: {
                    peerId: peer.id,
                    name: duckName,
                    imageUrl: imageUrl
                }
            });
            setConnections((connections) => {
                connections[serverId] = {
                    conn: conn,
                    peerId: serverId,
                    name: "server",
                };
                return connections
            });
        });

        peer.on('connection', function (conn: any) {
            conn.on('data', function (data: updateDucksMessage | connectionMessage | sendChatMessage) {
                if (data.type === "updateDucks") {
                    const ducks = data.data;
                    setDucks(data.data);
                    const winner = checkForWinner(ducks);
                    if (winner) {
                        setWinner(winner);
                    }
                }
                if (data.type === "chatMessage") {
                    console.log("received chat message", data.data)
                    setChatMessages((chatMessages) => {
                        const newChatMessages = [...chatMessages, data.data];
                        console.log(newChatMessages);
                        return newChatMessages
                    });
                }
                if (data.type === "connect") {
                    console.log("server connection established")
                }
            });
        });
    }

    const startServer = (duckName: string, imageUrl?: string) => {
        if (!peer || duckName == "") {
            return;
        }

        addDuck(duckName, imageUrl);
        setDuckName(duckName);
        setConnectionType("server");

        peer.on('connection', function (conn: any) {
            conn.on('data', function (data: connectionMessage | sendChatMessage) {
                if (data.type === "connect") {
                    const connection = data.data;
                    const conn = peer.connect(connection.peerId);

                    console.log("connecting to client", connection.peerId);

                    conn.on('open', function () {
                        console.log("sending message")
                        conn.send({
                            type: "connect",
                            data: {
                                peerId: peer.id,
                                imageUrl: imageUrl,
                                name: duckName,
                            }
                        });
                    });

                    setConnections((connections) => {
                        connections[connection.peerId] = {
                            conn: conn,
                            peerId: connection.peerId,
                            name: connection.name,
                        };
                        return connections
                    });
                    addDuck(connection.name, connection.imageUrl);
                }
                if (data.type === "chatMessage") {
                    console.log("received chat message", data.data);
                    setChatMessages((chatMessages) => {
                        const newChatMessages = [...chatMessages, data.data];
                        console.log(newChatMessages);
                        return newChatMessages
                    });
                    updateConnectionsChatMessages(data.data.senderId, data.data.senderName, data.data.message)
                }
            });
        });
    }

    if (connectionType === null) {
        return <ServerClientSelection onClientConnect={connectToServer}
                                      onServerStart={startServer}></ServerClientSelection>
    }

    return (
        <div>
            {connectionType === "server" && (
                <div className="grid grid-cols-4 gap-4">
                    <button onClick={startRace}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Start
                        Race
                    </button>
                    <button onClick={resetRace}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Reset
                        Race
                    </button>
                </div>
            )}

            {ducks.map((duck, i) => (
                <Duck key={i} {...duck} />
            ))}
            <div style={{
                left: distanceRequired,
                position: "absolute",
                height: "1000px",
                width: "1px",
                backgroundColor: "red",
                top: "50px"
            }}>


            </div>

            {winner ? (<div
                className="h-20 w-20 bg-red-600 right-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                The winner is {winner.name}
            </div>) : null}

            <Card
                className="max-w-sm"
            >
                <div className="h-80 overflow-y-scroll">
                    {chatMessages.map((message, i) => (
                        <div key={i} className="text-black">
                            {message.senderName}: {message.message}
                        </div>
                    ))}
                </div>
                <div className="flex max-w-md flex-row gap-4">
                    <TextInput
                        id="chatInput"
                        required
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <Button onClick={sendChatMessage}>
                        Submit
                    </Button>
                </div>
            </Card>
        </div>
    )
}
