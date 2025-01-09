'use client'
import Image from "next/image";
import Table from "../Table";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Description({ method, name, url, description, tableHeading, tableBody }: { method: string, name: string, url: string, description: string, tableHeading: string[], tableBody: string[][] }) {
    // track clipboard hover
    const [clipHover, setClipHover] = useState(false);
    const [copied, setCopied] = useState(false);

    // handle clipboard
    const handleClipboard = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    }

    if(!method) return null;
    return (
        <main className="mt-16 text-base border-2 border-[#6B8D99] p-4 rounded">
            <div className="flex gap-4 font-semibold">
                <p className="text-[#D26363]">{method}</p>
                <p>{name}</p>
            </div>
            {/* URL */}
            <div id="url" className="mt-4 relative" onMouseEnter={() => setClipHover(true)} onMouseLeave={() => setClipHover(false)} >
                <input type="text" value={url} className="w-full py-1 px-4 rounded-md text-[#3A3A3A] font-medium" disabled />
                <button onClick={handleClipboard} className="bg-[#6B8D99]" >
                    {clipHover &&
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Image src={clipHover === copied === false ? "/assets/copy.svg" : clipHover === copied === true ? "/assets/tick-circle.svg" : ""} alt="copy-button" width={25} height={25} className="absolute right-3 bottom-1.5 hover:bg-[#a8bfc8] py-0.5 px-1 rounded" />
                                </TooltipTrigger>
                                <TooltipContent color="white">
                                    <p>{copied ? "Copied" : "Copy"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    }

                </button>
            </div>
            {/* API Description */}
            <p className="mt-4">{description}</p>
            <aside id="dataDictionary" className="mt-4">
                <h2 className="mb-2 font-semibold">Data Dictionary</h2>
                {/* Data Dictionary table */}
                <Table tableHead={tableHeading} tableBody={tableBody} />
            </aside>
        </main>
    )
}
