'use client'

import { useEffect, useState } from "react";
import Description from "./Description";
import { apiDescription } from "@/lib/interface";


export default function ApiDescriptionPage() {
    const [data, setData] = useState<apiDescription>({
        projectedRebillRevenue: {
            method: "",
            name: "",
            url: "",
            description: "",
            table: {
                title: [],
                values: []
            },
        }
    })
    useEffect(() => {
        fetch('/data/api-description.json').then((response) => response.json()).then((data) => setData(data));
    }, [])

    if (!data.projectedRebillRevenue.method) return null;
    return (
        <section id='apiDescription' className="mx-auto max-w-screen-lg pb-16">
            {data.projectedRebillRevenue ? (
                <>
                    <p className="font-bold text-xl">Master Sheet APIs</p>
                    {Object.values(data).map((brand, index) => (
                        < Description key={index} method={brand.method} name={brand.name} url={brand.url} description={brand.description} tableHeading={brand.table.title} tableBody={brand.table.values} sampleResponse={brand.response} />
                    ))}
                </>
            ) : <p>Loading..............</p>}
        </section>
    )
}
