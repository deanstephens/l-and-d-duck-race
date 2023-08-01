"use client";

export type DuckProps = {
    x: number
    name: string
    imageUrl?: string
}

export const duckWidth = 100;

export const Duck = ({x, name, imageUrl}: DuckProps) => {
    return (<div style={{
        left: x,
        position: "relative",
        marginTop: "10px",
        marginBottom: "10px",
        transitionProperty: "left",
        transitionDuration: "1s",
        transitionTimingFunction: "linear",
    }}>
        <div style={{

            height: `${duckWidth}px`,
            width: `${duckWidth}px`,
            border: "1px solid white",

        }}>
            <img className="aspect-square" src={imageUrl}></img>
        </div>
        <span>{name}</span>
    </div>)
}