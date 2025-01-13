'use client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { useState } from "react";
import Table from "../Table";

export default function Description({ endpoints, tableHeading, tableBody, sampleResponse }: { endpoints: { name: string; method: string; url: string; description: string }[]; tableHeading: string[], tableBody: string[][]; sampleResponse: object }) {
    // track clipboard hover
    const [clipHover, setClipHover] = useState(false);
    const [copied, setCopied] = useState(false);

    // handle clipboard
    const handleClipboardFallback = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // Avoid scrolling to the bottom
        document.body.appendChild(textarea);
        textarea.select();

        try {
            // @ts-expect-error
            await navigator.clipboard.writeText(text);
            const successful = document.execCommand("copy");
            if (successful) {
                console.log("Fallback: Copied to clipboard");
            } else {
                console.error("Fallback: Copy failed");
            }
        } catch (error) {
            console.error("Fallback error: ", error);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const handleClipboard = async (text: string) => {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                console.log("Copied to clipboard using modern API!");
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (error) {
                console.error("Modern API failed, using fallback", error);
                handleClipboardFallback(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            }
        } else {
            console.warn("Clipboard API not supported, using fallback");
            handleClipboardFallback(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    if (!endpoints) return null;
    return (
        <main className="mt-16 text-base border-2 border-[#6B8D99] p-4 rounded">
            {endpoints.map(endpoint => (
                <div key={endpoint.url} className="mt-4">
                    <div className="flex gap-4 font-semibold">
                        <p className="text-[#D26363]">{endpoint.method}</p>
                        <p>{endpoint.name}</p>
                    </div>
                    {/* URL */}
                    <div id="url" className="mt-4 relative" onMouseEnter={() => setClipHover(true)} onMouseLeave={() => setClipHover(false)} >
                        <input type="text" value={endpoint.url} className="w-full py-1 px-4 rounded-md text-[#3A3A3A] font-medium" disabled />
                        <button onClick={() => handleClipboard(endpoint.url)} className="bg-[#6B8D99]" >
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
                    <p className="mt-4">{endpoint.description}</p>
                </div>
            ))}

            <aside id="dataDictionary" className="mt-4">
                <h2 className="mb-2 font-semibold">Data Dictionary</h2>
                {/* Data Dictionary table */}
                <Table tableHead={tableHeading} tableBody={tableBody} />
            </aside>
            {/* Response */}
            <section id="response" className="mt-4">
                <h2 className="font-semibold">Sample Response</h2>
                <h3 className="my-2 font-semibold">Success</h3>
                <aside className="bg-black text-orange-300 p-4 rounded overflow-x-auto">
                    <div className="head flex justify-between items-center">
                        <p className="text-white text-md bg-slate-400 py-0.5 px-2 rounded">Plain Text</p>
                        <button onClick={() => handleClipboard(JSON.stringify(sampleResponse, null, 2))} >
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Image src={!copied ? "/assets/copy-white.svg" : "/assets/tick-circle-white.svg"} alt="copy-button" width={25} height={25} className="right-3 bottom-1.5 hover:bg-[#a8bfc8] py-0.5 px-1 rounded" />
                                    </TooltipTrigger>
                                    <TooltipContent color="white">
                                        <p>{copied ? "Copied" : "Copy"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </button>
                    </div>
                    <pre>
                        <code>
                            {JSON.stringify(sampleResponse, null, 2)}
                        </code>
                    </pre>
                </aside>
            </section>
        </main>
    )
}
