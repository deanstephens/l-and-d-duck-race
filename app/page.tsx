"use client";
import {useRef, useState} from "react";
import {Duck, DuckProps, duckWidth} from "@/app/components/duck";

export default function Home() {
    const [duckName, setDuckName] = useState<string>("");
    const [serverPeerId, setServerPeerId] = useState<string>("");
    const [ducks, setDucks] = useState<DuckProps[]>([]);
    const [tickRate, setTickRate] = useState(100);
    const [distanceRequired, setDistanceRequired] = useState(1000);
    const [winner, setWinner] = useState<DuckProps | null>(null);

    const timer = useRef<NodeJS.Timeout | null>(null);

    const addDuck = () => {
        setDucks((ducks) => {
            return [...ducks, {x: 0, name: duckName}];
        });
    }

    const startRace = () => {
        if (timer.current) {
            return false;
        }
        timer.current = setInterval(() => {
            setDucks((ducks) => {
                const maxDuck = ducks.reduce((max, duck) => {
                    return Math.max(max.x, duck.x) ? max : duck;
                });

                if ((maxDuck.x + duckWidth) >= distanceRequired) {
                    clearTimeout(timer.current as NodeJS.Timeout);
                    timer.current = null;
                    setWinner(maxDuck);
                    return ducks;
                }

                const newDucks = ducks.map((duck) => {
                    const variance = Math.random() * 10;
                    return {...duck, x: duck.x + 10 + variance}
                })

                return newDucks
            });
        }, tickRate);
    }

    const resetRace = () => {
        setWinner(null);
        clearTimeout(timer.current as NodeJS.Timeout);
        timer.current = null;
        setDucks((ducks) => {
            return ducks.map((duck) => {
                return {...duck, x: 0}
            })
        });
    }

    const createServer = () => {
        const peer = new Peer();
        peer.on('open', function(id: string) {
            console.log('My peer ID is: ' + id);
        });

        peer.on('connection', function(conn: any) {
            conn.on('data', function(data: any){
                // Will print 'hi!'
                console.log(data);
            });
        });
    }

    const connectToServer = () => {
        const peer = new Peer();

        const conn = peer.connect(serverPeerId);

        console.log("connecting to server", serverPeerId)

        conn.on('open', function(){
            console.log("sending message")
            // here you have conn.id
            conn.send('hi!');
        });
    }

    return (
        <div>
            <div className="grid grid-cols-4 gap-4">
                <input type="text" id="first_name"
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Enter duck name" required
                       value={duckName}
                       onChange={e => setDuckName(e.target.value)}
                ></input>
                <button onClick={addDuck}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Duck
                </button>
                <button onClick={startRace}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Start Race
                </button>
                <button onClick={resetRace}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Reset Race
                </button>

                <button onClick={createServer}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Server
                </button>
                <input type="text" id="first_name"
                       className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Enter server id" required
                       value={serverPeerId}
                       onChange={e => setServerPeerId(e.target.value)}
                ></input>
                <button onClick={connectToServer}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Connect to Server
                </button>
            </div>
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
        </div>
    )
}
