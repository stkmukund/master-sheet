import Image from "next/image";

export default function BeanEater({ width, height}: { width: number, height: number }) {
    return (
        <div style={{ width: width, height: height }}>
            <Image src="/assets/BeanEater.svg" alt="loader" width={width} height={height} />
        </div>
    )
}
