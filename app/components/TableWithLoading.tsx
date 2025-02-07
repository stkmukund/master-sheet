import React from 'react'

export default function TableWithLoading({ tableHead }: { tableHead: string[] }) {
    return (
        <div className="scroll-container relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {tableHead.map((title, index) => (
                            <th key={index} scope="col" className="px-6 py-3">
                                {title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="odd:bg-white even:bg-gray-50 border-b">
                        {Array.from({ length: tableHead.length }).map((_, index) => (
                            <td key={index} className="px-6 py-4 ">
                                <p className='animate-pulse bg-blue-100 p-2 rounded'></p>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
