export type DuckProps = {
    x: number
    name: string
}

export const duckWidth = 100;

export const Duck = ({x, name}: DuckProps) => {
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

        }}></div>
        <span>{name}</span>
    </div>)
}