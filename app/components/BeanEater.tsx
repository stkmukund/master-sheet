
export default function BeanEater({ width, height}: { width: number, height: number }) {
    return (
        <div style={{ width: width, height: height }}>
            <img src="/assets/BeanEater.svg" alt="loader" />
        </div>
    )
}
