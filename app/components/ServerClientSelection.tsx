"use client";

import {Tabs, Card, Checkbox, Label, Modal, TextInput, Button} from "flowbite-react";
import {useState} from "react";

export type ServerClientSelectionProps = {
    onClientConnect: (duckName:string, serverId: string) => void,
    onServerStart: (duckName: string) => void
}

export const ServerClientSelection = ({ onClientConnect, onServerStart }: ServerClientSelectionProps) => {
    const [duckName, setDuckName] = useState<string>("");
    const [serverId, setServerId] = useState<string>("");

    return (
        <Card>
            <div>
                <div className="mb-2 block">
                    <Label
                        htmlFor={`duckName`}
                        value="Duck Name"
                    />
                </div>
                <TextInput
                    id={`duckName`}
                    placeholder=""
                    value={duckName}
                    onChange={(e) => setDuckName(e.target.value)}
                />
            </div>

            <Tabs.Group
                style="underline"
            >
                <Tabs.Item
                    active
                    title="Join server"
                >
                    <div className="flex max-w-md flex-col gap-4">
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="serverId"
                                    value="Server ID"
                                />
                            </div>
                            <TextInput
                                id="serverId"
                                placeholder=""
                                value={serverId}
                                onChange={(e) => setServerId(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => onClientConnect(duckName, serverId)}>Connect</Button>
                    </div>
                </Tabs.Item>
                <Tabs.Item
                    active
                    title="Start server"
                ><Button onClick={() => onServerStart(duckName)}>Connect</Button></Tabs.Item>
            </Tabs.Group>
        </Card>
    )
}