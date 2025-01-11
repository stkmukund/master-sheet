import Image from "next/image";

export default function reportLoading() {
    return (
        <div className="container flex justify-center">
            <div>
                <Image src={'/DoubleRing.svg'} alt="Loading" width={200} height={200} />
            </div>
        </div>
    )
}
